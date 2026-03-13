<?php
namespace App\Middleware;

use App\Core\Request;
use App\Helpers\Security;

/**
 * Input Sanitization Middleware - XSS Protection
 */
class SanitizeMiddleware
{
    public function handle(Request $request)
    {
        // Sanitize all input data
        $data = $request->all();
        $sanitized = Security::sanitize($data);
        
        // Update request data
        foreach ($sanitized as $key => $value) {
            $_REQUEST[$key] = $value;
        }
        
        return true;
    }
}

