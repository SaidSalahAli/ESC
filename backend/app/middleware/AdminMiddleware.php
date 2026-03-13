<?php
namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Helpers\JWT;

/**
 * Admin Middleware - Restrict access to admin only
 */
class AdminMiddleware
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
        
        // Check if user is admin
        if (!isset($payload['role']) || $payload['role'] !== 'admin') {
            return Response::forbidden('Admin access required');
        }
        
        // Store user data in request
        $request->user_id = $payload['user_id'];
        $request->user_role = $payload['role'];
        
        return true;
    }
}

