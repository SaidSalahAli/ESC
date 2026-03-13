<?php
namespace App\Controllers;

use App\Core\Response;

/**
 * Health Check Controller
 */
class HealthController
{
    /**
     * Health check endpoint
     */
    public function check()
    {
        return Response::success([
            'status' => 'ok',
            'timestamp' => time(),
            'version' => '1.0.0',
        ]);
    }
}

