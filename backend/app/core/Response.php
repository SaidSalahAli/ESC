<?php
namespace App\Core;

/**
 * Response Class - Handles HTTP responses
 */
class Response
{
    private $data;
    private $statusCode;
    private $headers = [];
    
    public function __construct($data = null, $statusCode = 200)
    {
        $this->data = $data;
        $this->statusCode = $statusCode;
    }
    
    /**
     * Create JSON response
     */
    public static function json($data, $statusCode = 200)
    {
        $response = new self($data, $statusCode);
        $response->header('Content-Type', 'application/json');
        return $response;
    }
    
    /**
     * Success response
     */
    public static function success($data = null, $message = 'Success', $statusCode = 200)
    {
        return self::json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }
    
    /**
     * Error response
     */
    public static function error($message = 'Error', $errors = null, $statusCode = 400)
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];
        
        if ($errors !== null) {
            $response['errors'] = $errors;
        }
        
        return self::json($response, $statusCode);
    }
    
    /**
     * Unauthorized response
     */
    public static function unauthorized($message = 'Unauthorized')
    {
        return self::error($message, null, 401);
    }
    
    /**
     * Forbidden response
     */
    public static function forbidden($message = 'Forbidden')
    {
        return self::error($message, null, 403);
    }
    
    /**
     * Not found response
     */
    public static function notFound($message = 'Resource not found')
    {
        return self::error($message, null, 404);
    }
    
    /**
     * Validation error response
     */
    public static function validationError($errors, $message = 'Validation failed')
    {
        return self::error($message, $errors, 422);
    }
    
    /**
     * Set header
     */
    public function header($key, $value)
    {
        $this->headers[$key] = $value;
        return $this;
    }
    
    /**
     * Set status code
     */
    public function status($code)
    {
        $this->statusCode = $code;
        return $this;
    }
    
    /**
     * Send response
     */
    public function send()
    {
        // Set status code
        http_response_code($this->statusCode);
        
        // Set headers
        foreach ($this->headers as $key => $value) {
            header("$key: $value");
        }
        
        // Output data
        if ($this->data !== null) {
            if (isset($this->headers['Content-Type']) && 
                $this->headers['Content-Type'] === 'application/json') {
                echo json_encode($this->data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            } else {
                echo $this->data;
            }
        }
        
        exit;
    }
}

