<?php
namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Helpers\Security;

/**
 * Rate Limiting Middleware
 */
class RateLimitMiddleware
{
    private $maxAttempts;
    private $timeWindow;
    
    public function __construct($maxAttempts = 60, $timeWindow = 60)
    {
        $this->maxAttempts = $maxAttempts;
        $this->timeWindow = $timeWindow;
    }
    
    public function handle(Request $request)
    {
        $identifier = $request->ip() . ':' . $request->path();
        
        if (!Security::checkRateLimit($identifier, $this->maxAttempts, $this->timeWindow)) {
            return Response::error('Too many requests. Please try again later.', null, 429);
        }
        
        return true;
    }
}

