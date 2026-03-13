<?php
// Test file to check if NewsletterController can be loaded

require_once __DIR__ . '/vendor/autoload.php';

try {
    $controller = new \App\Controllers\NewsletterController();
    echo json_encode([
        'success' => true,
        'message' => 'NewsletterController loaded successfully',
        'class' => get_class($controller)
    ]);
} catch (\Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error loading NewsletterController',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
