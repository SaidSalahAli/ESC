<?php
namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Helpers\JWT;

/**
 * Authentication Middleware
 */
class AuthMiddleware
{
    public function handle(Request $request)
    {
        $token = $request->bearerToken();
        
        if (!$token) {
            return Response::unauthorized('Authentication required');
        }
        
        $payload = JWT::verify($token);
        
        if ($payload === false) {
            return Response::unauthorized('Invalid or expired token');
        }
        
        // Store user data in request
        $request->user_id = $payload['user_id'];
        $request->user_role = $payload['role'] ?? 'customer';
        
        return true;
    }
}

