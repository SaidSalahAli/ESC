<?php
namespace App\Helpers;

/**
 * Security Helper - Protection against common attacks
 */
class Security
{
    /**
     * Sanitize input to prevent XSS
     */
    public static function sanitize($data)
    {
        if (is_array($data)) {
            return array_map([self::class, 'sanitize'], $data);
        }
        
        return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Validate CSRF token
     */
    public static function validateCsrfToken($token)
    {
        if (!isset($_SESSION['csrf_token']) || !isset($_SESSION['csrf_token_time'])) {
            return false;
        }
        
        // Check if token expired
        $config = require APP_PATH . '/config/config.php';
        $expiration = $config['security']['csrf_token_expiration'];
        
        if (time() - $_SESSION['csrf_token_time'] > $expiration) {
            return false;
        }
        
        return hash_equals($_SESSION['csrf_token'], $token);
    }
    
    /**
     * Generate CSRF token
     */
    public static function generateCsrfToken()
    {
        $token = bin2hex(random_bytes(32));
        $_SESSION['csrf_token'] = $token;
        $_SESSION['csrf_token_time'] = time();
        
        return $token;
    }
    
    /**
     * Hash password
     */
    public static function hashPassword($password)
    {
        $config = require APP_PATH . '/config/config.php';
        
        return password_hash(
            $password,
            $config['security']['password_hash_algo'],
            ['cost' => $config['security']['password_cost']]
        );
    }
    
    /**
     * Verify password
     */
    public static function verifyPassword($password, $hash)
    {
        return password_verify($password, $hash);
    }
    
    /**
     * Generate random string
     */
    public static function randomString($length = 32)
    {
        return bin2hex(random_bytes($length / 2));
    }
    
    /**
     * Encrypt data
     */
    public static function encrypt($data, $key = null)
    {
        if ($key === null) {
            $config = require APP_PATH . '/config/config.php';
            $key = $config['jwt']['secret'];
        }
        
        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-cbc'));
        $encrypted = openssl_encrypt($data, 'aes-256-cbc', $key, 0, $iv);
        
        return base64_encode($encrypted . '::' . $iv);
    }
    
    /**
     * Decrypt data
     */
    public static function decrypt($data, $key = null)
    {
        if ($key === null) {
            $config = require APP_PATH . '/config/config.php';
            $key = $config['jwt']['secret'];
        }
        
        list($encrypted, $iv) = explode('::', base64_decode($data), 2);
        
        return openssl_decrypt($encrypted, 'aes-256-cbc', $key, 0, $iv);
    }
    
    /**
     * Prevent SQL Injection (already handled by PDO, but additional validation)
     */
    public static function validateSqlInput($input)
    {
        // Remove common SQL injection patterns
        $patterns = [
            '/(\bOR\b.*?=.*?)/i',
            '/(\bAND\b.*?=.*?)/i',
            '/(\bUNION\b.*?\bSELECT\b)/i',
            '/(\bINSERT\b.*?\bINTO\b)/i',
            '/(\bUPDATE\b.*?\bSET\b)/i',
            '/(\bDELETE\b.*?\bFROM\b)/i',
            '/(\bDROP\b.*?\bTABLE\b)/i',
        ];
        
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $input)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Rate limiting check
     */
    public static function checkRateLimit($identifier, $maxAttempts = 5, $timeWindow = 300)
    {
        $key = 'rate_limit_' . $identifier;
        
        if (!isset($_SESSION[$key])) {
            $_SESSION[$key] = [
                'attempts' => 1,
                'first_attempt' => time(),
            ];
            return true;
        }
        
        $data = $_SESSION[$key];
        
        // Reset if time window passed
        if (time() - $data['first_attempt'] > $timeWindow) {
            $_SESSION[$key] = [
                'attempts' => 1,
                'first_attempt' => time(),
            ];
            return true;
        }
        
        // Check if exceeded
        if ($data['attempts'] >= $maxAttempts) {
            return false;
        }
        
        // Increment attempts
        $_SESSION[$key]['attempts']++;
        
        return true;
    }
    
    /**
     * Validate file upload
     */
    public static function validateUpload($file, $allowedTypes = null, $maxSize = null)
    {
        $config = require APP_PATH . '/config/config.php';
        
        if ($allowedTypes === null) {
            $allowedTypes = $config['upload']['allowed_extensions'];
        }
        
        if ($maxSize === null) {
            $maxSize = $config['upload']['max_file_size'];
        }
        
        // Check if file was uploaded
        if (!isset($file['error']) || is_array($file['error'])) {
            return ['success' => false, 'message' => 'Invalid file upload'];
        }
        
        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'message' => 'File upload error'];
        }
        
        // Check file size
        if ($file['size'] > $maxSize) {
            return ['success' => false, 'message' => 'File size exceeds limit'];
        }
        
        // Check file extension
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $allowedTypes)) {
            return ['success' => false, 'message' => 'File type not allowed'];
        }
        
        // Check MIME type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        $allowedMimes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
        ];
        
        if (!isset($allowedMimes[$extension]) || $mimeType !== $allowedMimes[$extension]) {
            return ['success' => false, 'message' => 'Invalid file type'];
        }
        
        return ['success' => true];
    }
}

