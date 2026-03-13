<?php
/**
 * Class Loader - Manual class loading as fallback
 * This ensures critical classes are loaded even if autoloader fails
 */

if (!defined('APP_PATH')) {
    define('APP_PATH', dirname(__DIR__));
}

/**
 * Load core classes manually
 */
function loadCoreClasses() {
    if (!defined('APP_PATH')) {
        return false;
    }
    
    $coreClasses = [
        'Database',
        'Model',
        'Request',
        'Response',
        'Router'
    ];
    
    $loaded = 0;
    foreach ($coreClasses as $class) {
        $file = APP_PATH . '/core/' . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
            $loaded++;
        }
    }
    
    return $loaded === count($coreClasses);
}

// Auto-load core classes
if (!loadCoreClasses()) {
    // Log error if in debug mode
    if (defined('APP_DEBUG') && APP_DEBUG) {
        error_log('Warning: Some core classes failed to load manually');
    }
}

