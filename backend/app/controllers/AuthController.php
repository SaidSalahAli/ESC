<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\User;
use App\Helpers\Validator;
use App\Helpers\Security;
use App\Helpers\JWT;

/**
 * Authentication Controller
 */
class AuthController
{
    private $userModel;
    
    public function __construct()
    {
        $this->userModel = new User();
    }
    
    /**
     * Register new user
     */
    public function register(Request $request)
    {
        try {
            // Validate input
            $validator = new Validator($request->all(), [
                'first_name' => 'required|min:2|max:100',
                'last_name' => 'required|min:2|max:100',
                'email' => 'required|email|unique:users,email',
                'phone' => 'required|phone',
                'password' => 'required|min:8|confirmed',
            ]);
            
            if (!$validator->validate()) {
                $errors = $validator->errors();
                error_log('Registration validation failed: ' . json_encode($errors));
                return Response::validationError($errors, 'Validation failed');
            }
            
            // Check rate limiting
            if (!Security::checkRateLimit('register_' . $request->ip(), 5, 300)) {
                return Response::error('Too many registration attempts. Please try again later.', null, 429);
            }
            
            // Hash password
            $userData = [
                'first_name' => trim($request->input('first_name')),
                'last_name' => trim($request->input('last_name')),
                'email' => trim(strtolower($request->input('email'))),
                'phone' => trim($request->input('phone')),
                'password' => Security::hashPassword($request->input('password')),
                'role' => 'customer',
                'is_active' => 1,
            ];
            
            // Log registration attempt (without password)
            $logData = $userData;
            unset($logData['password']);
            error_log('Registration attempt: ' . json_encode($logData));
            
            $userId = $this->userModel->create($userData);
            
            if (!$userId) {
                error_log('Registration failed: User creation returned false');
                return Response::error('Registration failed. Please try again.', null, 500);
            }
            
            // Get user
            $user = $this->userModel->find($userId);
            
            if (!$user) {
                error_log('Registration failed: User not found after creation. ID: ' . $userId);
                return Response::error('Registration failed. User not found.', null, 500);
            }
            
            // Remove password from response
            unset($user['password']);
            
            // Generate tokens
            $token = JWT::generate([
                'user_id' => $userId,
                'email' => $user['email'],
                'role' => $user['role'],
            ]);
            
            $refreshToken = JWT::generateRefreshToken($userId);
            
            return Response::success([
                'user' => $user,
                'token' => $token,
                'refresh_token' => $refreshToken,
            ], 'Registration successful', 201);
            
        } catch (\Exception $e) {
            error_log('Registration exception: ' . $e->getMessage() . ' | Trace: ' . $e->getTraceAsString());
            return Response::error('Registration failed: ' . $e->getMessage(), [
                'exception' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }
    
    /**
     * Login user
     */
    public function login(Request $request)
    {
        // Validate input
        $validator = new Validator($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);
        
        if (!$validator->validate()) {
            return Response::validationError($validator->errors());
        }
        
        // Check rate limiting
        if (!Security::checkRateLimit('login_' . $request->ip(), 5, 300)) {
            return Response::error('Too many login attempts. Please try again later.', null, 429);
        }
        
        try {
            // Find user
            $user = $this->userModel->findByEmailWithPassword($request->input('email'));
            
            if (!$user) {
                return Response::error('Invalid credentials', null, 401);
            }
            
            // Verify password
            if (!Security::verifyPassword($request->input('password'), $user['password'])) {
                return Response::error('Invalid credentials', null, 401);
            }
            
            // Check if user is active
            if (!$user['is_active']) {
                return Response::error('Account is inactive', null, 403);
            }
            
            // Update last login
            $this->userModel->updateLastLogin($user['id']);
            
            // Remove password from user data
            unset($user['password']);
            
            // Generate tokens
            $token = JWT::generate([
                'user_id' => $user['id'],
                'email' => $user['email'],
                'role' => $user['role'],
            ]);
            
            $refreshToken = JWT::generateRefreshToken($user['id']);
            
            return Response::success([
                'user' => $user,
                'token' => $token,
                'refresh_token' => $refreshToken,
            ], 'Login successful');
            
        } catch (\Exception $e) {
            return Response::error('Login failed: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Refresh access token
     */
    public function refresh(Request $request)
    {
        $refreshToken = $request->input('refresh_token');
        
        if (!$refreshToken) {
            return Response::error('Refresh token required');
        }
        
        $payload = JWT::verify($refreshToken);
        
        if ($payload === false || !isset($payload['type']) || $payload['type'] !== 'refresh') {
            return Response::error('Invalid refresh token', null, 401);
        }
        
        try {
            $user = $this->userModel->find($payload['user_id']);
            
            if (!$user || !$user['is_active']) {
                return Response::error('User not found or inactive', null, 401);
            }
            
            // Generate new access token
            $token = JWT::generate([
                'user_id' => $user['id'],
                'email' => $user['email'],
                'role' => $user['role'],
            ]);
            
            return Response::success([
                'token' => $token,
            ], 'Token refreshed successfully');
            
        } catch (\Exception $e) {
            return Response::error('Token refresh failed: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Get current user profile
     */
    public function me(Request $request)
    {
        try {
            $user = $this->userModel->find($request->user_id);
            
            if (!$user) {
                return Response::notFound('User not found');
            }
            
            return Response::success($user);
            
        } catch (\Exception $e) {
            return Response::error('Failed to get user: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        // Validate input
        $validator = new Validator($request->all(), [
            'first_name' => 'min:2|max:100',
            'last_name' => 'min:2|max:100',
            'phone' => 'phone',
        ]);
        
        if (!$validator->validate()) {
            return Response::validationError($validator->errors());
        }
        
        try {
            $updateData = array_filter([
                'first_name' => $request->input('first_name'),
                'last_name' => $request->input('last_name'),
                'phone' => $request->input('phone'),
            ]);
            
            if (empty($updateData)) {
                return Response::error('No data to update');
            }
            
            $this->userModel->update($request->user_id, $updateData);
            
            $user = $this->userModel->find($request->user_id);
            
            return Response::success($user, 'Profile updated successfully');
            
        } catch (\Exception $e) {
            return Response::error('Profile update failed: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        // Validate input
        $validator = new Validator($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);
        
        if (!$validator->validate()) {
            return Response::validationError($validator->errors());
        }
        
        try {
            $user = $this->userModel->findByEmailWithPassword(
                $this->userModel->find($request->user_id)['email']
            );
            
            // Verify current password
            if (!Security::verifyPassword($request->input('current_password'), $user['password'])) {
                return Response::error('Current password is incorrect', null, 401);
            }
            
            // Update password
            $newPassword = Security::hashPassword($request->input('new_password'));
            $this->userModel->execute(
                "UPDATE users SET password = ? WHERE id = ?",
                [$newPassword, $request->user_id]
            );
            
            return Response::success(null, 'Password changed successfully');
            
        } catch (\Exception $e) {
            return Response::error('Password change failed: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Logout (invalidate token - handled on client side)
     */
    public function logout(Request $request)
    {
        return Response::success(null, 'Logged out successfully');
    }
    
    /**
     * Get CSRF token
     */
    public function getCsrfToken(Request $request)
    {
        $token = Security::generateCsrfToken();
        
        return Response::success([
            'csrf_token' => $token,
        ]);
    }
    
    /**
     * Login/Register with Google OAuth
     */
    public function googleAuth(Request $request)
    {
        // Validate input
        $validator = new Validator($request->all(), [
            'id_token' => 'required|string',
        ]);
        
        if (!$validator->validate()) {
            return Response::validationError($validator->errors());
        }
        
        try {
            $idToken = $request->input('id_token');
            
            if (empty($idToken)) {
                return Response::error('Google ID token is required', null, 400);
            }
            
            // Log token info for debugging (first 50 chars only for security)
            error_log('Google auth attempt - Token length: ' . strlen($idToken) . ', First chars: ' . substr($idToken, 0, 50));
            
            // Verify Google ID token
            try {
                $googleUserData = $this->verifyGoogleToken($idToken);
            } catch (\Exception $verifyException) {
                error_log('Google token verification exception: ' . $verifyException->getMessage());
                return Response::error($verifyException->getMessage(), null, 401);
            }
            
            if (!$googleUserData) {
                return Response::error('Invalid Google token. Please try signing in again.', null, 401);
            }
            
            // Find or create user
            $user = $this->userModel->findOrCreateByGoogle($googleUserData);
            
            if (!$user) {
                return Response::error('Failed to create user account', null, 500);
            }
            
            // Check if user is active
            if (!$user['is_active']) {
                return Response::error('Account is inactive', null, 403);
            }
            
            // Update last login
            $this->userModel->updateLastLogin($user['id']);
            
            // Remove password from user data
            unset($user['password']);
            
            // Generate tokens
            $token = JWT::generate([
                'user_id' => $user['id'],
                'email' => $user['email'],
                'role' => $user['role'],
            ]);
            
            $refreshToken = JWT::generateRefreshToken($user['id']);
            
            return Response::success([
                'user' => $user,
                'token' => $token,
                'refresh_token' => $refreshToken,
            ], 'Google authentication successful');
            
        } catch (\Exception $e) {
            // Log the full error for debugging
            error_log('Google authentication exception: ' . $e->getMessage() . ' | Trace: ' . $e->getTraceAsString());
            
            // Return more detailed error message
            $errorMessage = $e->getMessage();
            if (strpos($errorMessage, 'Google token verification failed') !== false) {
                return Response::error($errorMessage, null, 401);
            }
            
            return Response::error('Google authentication failed: ' . $errorMessage, null, 500);
        }
    }
    
    /**
     * Verify Google ID token and extract user data
     * Uses both tokeninfo endpoint and direct JWT decoding for better reliability
     */
    private function verifyGoogleToken($idToken)
    {
        // Validate token format first
        if (empty($idToken) || !is_string($idToken)) {
            error_log('Google token verification: Invalid token format');
            return false;
        }
        
        // Get Google Client ID from environment (try multiple methods)
        $clientId = $_ENV['GOOGLE_CLIENT_ID'] ?? getenv('GOOGLE_CLIENT_ID') ?? null;
        
        if (empty($clientId)) {
            error_log('Google token verification: GOOGLE_CLIENT_ID not configured in environment');
            throw new \Exception('Google Client ID not configured');
        }
        
        // First, try to decode JWT directly (faster and more reliable)
        $parts = explode('.', $idToken);
        if (count($parts) === 3) {
            $payload = json_decode($this->base64UrlDecode($parts[1]), true);
            
            if ($payload && isset($payload['sub'])) {
                // Verify issuer
                if (!isset($payload['iss']) || $payload['iss'] !== 'https://accounts.google.com') {
                    error_log('Google token verification: Invalid issuer');
                    return false;
                }
                
                // Verify audience (client ID)
                $audience = isset($payload['aud']) ? (is_array($payload['aud']) ? $payload['aud'] : [$payload['aud']]) : [];
                if (!empty($audience) && !in_array($clientId, $audience)) {
                    error_log('Google token verification: Client ID mismatch. Expected: ' . $clientId . ', Got: ' . print_r($payload['aud'], true));
                    return false;
                }
                
                // Check token expiration
                if (isset($payload['exp']) && $payload['exp'] < time()) {
                    error_log('Google token verification: Token expired. Exp: ' . $payload['exp'] . ', Now: ' . time());
                    return false;
                }
                
                // Check issued at time (not before)
                if (isset($payload['nbf']) && $payload['nbf'] > time()) {
                    error_log('Google token verification: Token not yet valid');
                    return false;
                }
                
                // Return user data from JWT payload
                return [
                    'id' => $payload['sub'],
                    'email' => $payload['email'] ?? null,
                    'name' => $payload['name'] ?? null,
                    'picture' => $payload['picture'] ?? null,
                    'email_verified' => $payload['email_verified'] ?? false,
                ];
            }
        }
        
        // Fallback: Verify token with Google tokeninfo endpoint
        $url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($idToken);
        
        error_log('Google token verification - Using tokeninfo endpoint');
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        // Check for curl errors
        if ($response === false || !empty($curlError)) {
            error_log('Google token verification curl error: ' . $curlError);
            return false;
        }
        
        // Check HTTP status code
        if ($httpCode !== 200) {
            $errorData = json_decode($response, true);
            $errorMessage = isset($errorData['error_description']) ? $errorData['error_description'] : (isset($errorData['error']) ? $errorData['error'] : $response);
            error_log('Google token verification failed with HTTP code: ' . $httpCode . ', Error: ' . $errorMessage);
            throw new \Exception('Google token verification failed: ' . $errorMessage . ' (HTTP ' . $httpCode . ')');
        }
        
        $data = json_decode($response, true);
        
        // Check if JSON decode was successful
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('Google token verification JSON decode error: ' . json_last_error_msg());
            return false;
        }
        
        // Check if required fields exist
        if (!$data || !isset($data['sub'])) {
            error_log('Google token verification: Missing required fields');
            return false;
        }
        
        // Verify audience (client ID)
        if (isset($data['aud'])) {
            $audience = is_array($data['aud']) ? $data['aud'] : [$data['aud']];
            if (!in_array($clientId, $audience)) {
                error_log('Google token verification: Client ID mismatch');
                return false;
            }
        }
        
        // Return user data
        return [
            'id' => $data['sub'],
            'email' => $data['email'] ?? null,
            'name' => $data['name'] ?? null,
            'picture' => $data['picture'] ?? null,
            'email_verified' => $data['email_verified'] ?? false,
        ];
    }
    
    /**
     * Base64 URL decode helper
     */
    private function base64UrlDecode($data)
    {
        $padding = 4 - (strlen($data) % 4);
        if ($padding !== 4) {
            $data .= str_repeat('=', $padding);
        }
        return base64_decode(strtr($data, '-_', '+/'));
    }
}


