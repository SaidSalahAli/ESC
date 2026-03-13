<?php
namespace App\Core;

/**
 * Request Class - Handles HTTP requests
 */
class Request
{
    private $data = [];
    private $headers = [];
    public $user_id = null;
    public $user_role = null;
    
    public function __construct()
    {
        $this->parseRequest();
        $this->parseHeaders();
    }
    
    /**
     * Parse incoming request
     */
    private function parseRequest()
    {
        // Parse JSON body for POST, PUT, DELETE
        if (in_array($this->method(), ['POST', 'PUT', 'DELETE', 'PATCH'])) {
            // Check if it's multipart/form-data (file upload)
            $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
            
            if (strpos($contentType, 'multipart/form-data') !== false) {
                // For POST and PUT/PATCH, use $_POST directly
                // PHP populates $_POST for POST requests with FormData
                // For PUT/PATCH, we'll use POST route instead
                $this->data = $_POST;
            } else {
                // Try to parse as JSON
                $input = file_get_contents('php://input');
                $data = json_decode($input, true);
                
                if (json_last_error() === JSON_ERROR_NONE && is_array($data)) {
                    $this->data = $data;
                } else {
                    $this->data = $_POST;
                }
            }
        }
        
        // Add query parameters
        $this->data = array_merge($this->data, $_GET);
    }
    
    /**
     * Parse headers
     */
    private function parseHeaders()
    {
        $this->headers = getallheaders();
    }
    
    /**
     * Get request method
     */
    public function method()
    {
        return $_SERVER['REQUEST_METHOD'];
    }
    
    /**
     * Get request path
     */
    public function path()
    {
        $path = $_SERVER['REQUEST_URI'] ?? '/';
        
        // Remove query string
        $position = strpos($path, '?');
        if ($position !== false) {
            $path = substr($path, 0, $position);
        }
        
        // When .htaccess rewrites /api/* to backend/public/index.php
        // REQUEST_URI is still /api/products/featured (or /escwear.com/api/products/featured)
        // SCRIPT_NAME is /escwear.com/backend/public/index.php
        
        // First, try to extract /api/* directly from REQUEST_URI using regex
        if (preg_match('#(/api/.*)$#', $path, $matches)) {
            // Found /api/ path, use it directly
            $path = $matches[1];
        } elseif (preg_match('#(/api)$#', $path, $matches)) {
            // Found /api (without trailing slash)
            $path = $matches[1];
        } else {
            // Fallback: Remove base path (for direct access or subdirectory installations)
            $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
            $basePath = str_replace('/index.php', '', $scriptName);
            
            if ($basePath && strpos($path, $basePath) === 0) {
                $path = substr($path, strlen($basePath));
            }
            
            // If still no /api found, try to find it in the path
            if (strpos($path, '/api/') !== false) {
                $apiPos = strpos($path, '/api/');
                $path = substr($path, $apiPos);
            } elseif (strpos($path, '/api') !== false && $path !== '/api') {
                $apiPos = strpos($path, '/api');
                $path = substr($path, $apiPos);
            }
        }
        
        // Ensure path starts with /
        if (empty($path) || $path === '/') {
            $path = '/';
        } else {
            if ($path[0] !== '/') {
                $path = '/' . $path;
            }
        }
        
        return $path;
    }
    
    /**
     * Get input value
     */
    public function input($key, $default = null)
    {
        return $this->data[$key] ?? $default;
    }
    
    /**
     * Get all input data
     */
    public function all()
    {
        return $this->data;
    }
    
    /**
     * Check if input exists
     */
    public function has($key)
    {
        return isset($this->data[$key]);
    }
    
    /**
     * Get header value
     */
    public function header($key, $default = null)
    {
        return $this->headers[$key] ?? $default;
    }
    
    /**
     * Get all headers
     */
    public function headers()
    {
        return $this->headers;
    }
    
    /**
     * Get bearer token from Authorization header
     */
    public function bearerToken()
    {
        $header = $this->header('Authorization', '');
        
        if (preg_match('/Bearer\s+(.*)$/i', $header, $matches)) {
            return $matches[1];
        }
        
        return null;
    }
    
    /**
     * Get uploaded file
     */
    public function file($key)
    {
        return $_FILES[$key] ?? null;
    }
    
    /**
     * Get client IP address
     */
    public function ip()
    {
        return $_SERVER['REMOTE_ADDR'] ?? null;
    }
    
    /**
     * Get user agent
     */
    public function userAgent()
    {
        return $_SERVER['HTTP_USER_AGENT'] ?? null;
    }
    
    /**
     * Get language from Accept-Language header
     */
    public function language()
    {
        $lang = $this->header('Accept-Language', 'en');
        // Normalize language code (ar, en)
        $lang = strtolower($lang);
        if (in_array($lang, ['ar', 'en'])) {
            return $lang;
        }
        return 'en'; // default
    }
}

