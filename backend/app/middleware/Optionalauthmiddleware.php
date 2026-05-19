<?php

namespace App\Middleware;

use App\Core\Request;
use App\Helpers\JWT;

/**
 * Optional Authentication Middleware
 * If a valid token is present, sets user_id and user_role on the request.
 * If no token or invalid token, continues without blocking.
 */
class OptionalAuthMiddleware
{
    public function handle(Request $request)
    {
        $token = $request->bearerToken();

        if ($token) {
            $payload = JWT::verify($token);
            if ($payload !== false) {
                $request->user_id = $payload['user_id'];
                $request->user_role = $payload['role'] ?? 'customer';
            }
        }

        return true;
    }
}
