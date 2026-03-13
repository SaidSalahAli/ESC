<?php
/**
 * PSR-4 Autoloader
 */
class Autoloader
{
    public static function load($className)
    {
        // Convert namespace to file path
        $className = str_replace('App\\', '', $className);
        $className = str_replace('\\', '/', $className);
        
        // Build file path
        $file = APP_PATH . '/' . $className . '.php';
        
        // Try exact path first
        if (file_exists($file)) {
            require_once $file;
            return true;
        }
        
        // Try with lowercase (for case-sensitive file systems)
        $fileLower = APP_PATH . '/' . strtolower($className) . '.php';
        if (file_exists($fileLower)) {
            require_once $fileLower;
            return true;
        }
        
        // Try with first letter lowercase (for some naming conventions)
        $fileFirstLower = APP_PATH . '/' . lcfirst($className) . '.php';
        if (file_exists($fileFirstLower)) {
            require_once $fileFirstLower;
            return true;
        }
        
        // Debug: Log missing file (only in development)
        if (defined('APP_DEBUG') && APP_DEBUG) {
            error_log("Autoloader: Class not found - {$className}. Tried: {$file}");
        }
        
        return false;
    }
}

