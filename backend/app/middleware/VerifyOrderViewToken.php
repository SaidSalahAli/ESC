<?php
namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;

/**
 * Middleware to verify order view tokens (magic links)
 * Allows anonymous access to order details if valid token is provided
 */
class VerifyOrderViewToken
{
    private $config;
    
    public function __construct()
    {
        $this->config = require APP_PATH . '/config/config.php';
    }
    
    /**
     * Handle request and verify token
     * If valid token: set request params and isValidViewToken = true
     * If no token: continue normally (auth check happens in controller)
     * If invalid token: reject
     */
    public function handle(Request $request, $next, $orderId = null)
    {
        $viewToken = $request->input('view_token');
        
        // If no token, proceed normally (will require authentication in controller)
        if (!$viewToken) {
            return $next($request);
        }
        
        // Attempt to verify token
        try {
            $isValid = $this->verifyToken($viewToken, $orderId);
            
            if ($isValid) {
                // Mark request as having valid view token
                $_REQUEST['isValidViewToken'] = true;
                $_REQUEST['viewToken'] = $viewToken;
                return $next($request);
            } else {
                // Invalid token
                return Response::json([
                    'success' => false,
                    'message' => 'Invalid or expired view token',
                    'code' => 'INVALID_TOKEN'
                ], 401);
            }
        } catch (\Exception $e) {
            error_log('VerifyOrderViewToken error: ' . $e->getMessage());
            return Response::json([
                'success' => false,
                'message' => 'Token verification failed',
                'code' => 'TOKEN_VERIFY_ERROR'
            ], 400);
        }
    }
    
    /**
     * Verify token format and HMAC + timestamp validity
     * Token format: base64(timestamp:hmac)
     * HMAC signed over: orderId|timestamp
     */
    private function verifyToken($token, $orderId)
    {
        try {
            // Decode token
            $decoded = base64_decode($token, true);
            if (!$decoded) {
                error_log("Token decode failed for token: {$token}");
                return false;
            }
            
            // Parse timestamp:hmac
            $parts = explode(':', $decoded);
            if (count($parts) !== 2) {
                error_log("Token format invalid: expected 2 parts, got " . count($parts));
                return false;
            }
            
            [$ts, $hmac] = $parts;
            
            // Check timestamp not expired (default TTL: 7 days = 604800 seconds)
            $ttl = 604800;
            if (time() - (int)$ts > $ttl) {
                error_log("Token expired: issued at {$ts}, now " . time() . ", TTL {$ttl}");
                return false;
            }
            
            // Verify HMAC
            $secret = $this->config['jwt']['secret'] ?? ($_ENV['JWT_SECRET'] ?? 'change-this-secret-key');
            $expectedHmac = hash_hmac('sha256', $orderId . '|' . $ts, $secret);
            
            if (!hash_equals($hmac, $expectedHmac)) {
                error_log("HMAC mismatch for order {$orderId}: expected {$expectedHmac}, got {$hmac}");
                return false;
            }
            
            return true;
            
        } catch (\Exception $e) {
            error_log("Token verification exception: " . $e->getMessage());
            return false;
        }
    }
}
?>
