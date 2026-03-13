<?php
namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Helpers\Security;

/**
 * CSRF Protection Middleware
 */
class CsrfMiddleware
{
    public function handle(Request $request)
    {
        // Skip CSRF check for GET requests
        if ($request->method() === 'GET') {
            return true;
        }
        
        $token = $request->header('X-CSRF-Token') ?? $request->input('_csrf_token');
        
        if (!$token) {
            return Response::error('CSRF token missing', null, 419);
        }
        
        if (!Security::validateCsrfToken($token)) {
            return Response::error('CSRF token invalid or expired', null, 419);
        }
        
        return true;
    }
}

