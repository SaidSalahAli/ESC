<?php
namespace App\Helpers;

/**
 * JWT Helper - JSON Web Token handling
 */
class JWT
{
    /**
     * Generate JWT token
     */
    public static function generate($payload, $expiration = null)
    {
        $config = require APP_PATH . '/config/config.php';
        
        if ($expiration === null) {
            $expiration = $config['jwt']['expiration'];
        }
        
        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256',
        ];
        
        $payload['iat'] = time();
        $payload['exp'] = time() + $expiration;
        
        $headerEncoded = self::base64UrlEncode(json_encode($header));
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));
        
        $signature = hash_hmac(
            'sha256',
            "$headerEncoded.$payloadEncoded",
            $config['jwt']['secret'],
            true
        );
        
        $signatureEncoded = self::base64UrlEncode($signature);
        
        return "$headerEncoded.$payloadEncoded.$signatureEncoded";
    }
    
    /**
     * Verify and decode JWT token
     */
    public static function verify($token)
    {
        $config = require APP_PATH . '/config/config.php';
        
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            return false;
        }
        
        list($headerEncoded, $payloadEncoded, $signatureEncoded) = $parts;
        
        // Verify signature
        $signature = hash_hmac(
            'sha256',
            "$headerEncoded.$payloadEncoded",
            $config['jwt']['secret'],
            true
        );
        
        $signatureCheck = self::base64UrlEncode($signature);
        
        if (!hash_equals($signatureCheck, $signatureEncoded)) {
            return false;
        }
        
        // Decode payload
        $payload = json_decode(self::base64UrlDecode($payloadEncoded), true);
        
        // Check expiration
        if (!isset($payload['exp']) || $payload['exp'] < time()) {
            return false;
        }
        
        return $payload;
    }
    
    /**
     * Generate refresh token
     */
    public static function generateRefreshToken($userId)
    {
        $config = require APP_PATH . '/config/config.php';
        
        return self::generate([
            'user_id' => $userId,
            'type' => 'refresh',
        ], $config['jwt']['refresh_expiration']);
    }
    
    /**
     * Base64 URL encode
     */
    private static function base64UrlEncode($data)
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    /**
     * Base64 URL decode
     */
    private static function base64UrlDecode($data)
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }
    
    /**
     * Get user ID from token
     */
    public static function getUserId($token)
    {
        $payload = self::verify($token);
        
        if ($payload === false) {
            return null;
        }
        
        return $payload['user_id'] ?? null;
    }
    
    /**
     * Get payload from token
     */
    public static function getPayload($token)
    {
        return self::verify($token);
    }
}

