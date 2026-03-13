<?php
/**
 * Backend Diagnostic Tool
 * URL: https://escwear.com/backend/public/diagnostic.php
 * This file helps diagnose backend issues
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$diagnostics = [
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => [
        'php_version' => PHP_VERSION,
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'N/A',
        'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'N/A',
        'script_name' => $_SERVER['SCRIPT_NAME'] ?? 'N/A',
        'request_uri' => $_SERVER['REQUEST_URI'] ?? 'N/A',
    ],
    'checks' => []
];

// Check 1: PHP Version
$diagnostics['checks']['php_version'] = [
    'status' => version_compare(PHP_VERSION, '7.4.0', '>=') ? 'ok' : 'error',
    'version' => PHP_VERSION,
    'required' => '>= 7.4.0'
];

// Check 2: Required Extensions
$requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'mbstring', 'openssl'];
foreach ($requiredExtensions as $ext) {
    $diagnostics['checks']['extension_' . $ext] = [
        'status' => extension_loaded($ext) ? 'ok' : 'error',
        'loaded' => extension_loaded($ext)
    ];
}

// Check 3: File Structure
$requiredFiles = [
    '../app/helpers/Autoloader.php',
    '../app/config/config.php',
    '../app/core/Router.php',
    '../app/core/Request.php',
    '../routes/api.php',
    '../.env'
];

foreach ($requiredFiles as $file) {
    $fullPath = __DIR__ . '/' . $file;
    $diagnostics['checks']['file_' . basename($file)] = [
        'status' => file_exists($fullPath) ? 'ok' : 'error',
        'exists' => file_exists($fullPath),
        'path' => $fullPath,
        'readable' => file_exists($fullPath) ? is_readable($fullPath) : false
    ];
}

// Check 4: Directory Permissions
$requiredDirs = [
    '../app',
    '../app/controllers',
    '../app/core',
    '../public/uploads',
    '../logs'
];

foreach ($requiredDirs as $dir) {
    $fullPath = __DIR__ . '/' . $dir;
    $diagnostics['checks']['dir_' . basename($dir)] = [
        'status' => is_dir($fullPath) ? 'ok' : 'error',
        'exists' => is_dir($fullPath),
        'readable' => is_dir($fullPath) ? is_readable($fullPath) : false,
        'writable' => is_dir($fullPath) ? is_writable($fullPath) : false
    ];
}

// Check 5: .env File
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $envContent = file_get_contents($envFile);
    $hasDbConfig = strpos($envContent, 'DB_HOST') !== false && 
                   strpos($envContent, 'DB_NAME') !== false;
    
    $diagnostics['checks']['env_file'] = [
        'status' => $hasDbConfig ? 'ok' : 'warning',
        'exists' => true,
        'has_db_config' => $hasDbConfig
    ];
} else {
    $diagnostics['checks']['env_file'] = [
        'status' => 'error',
        'exists' => false
    ];
}

// Check 6: Database Connection (if .env exists)
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $dbConfig = [];
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $dbConfig[trim($parts[0])] = trim($parts[1]);
        }
    }
    
    if (isset($dbConfig['DB_HOST']) && isset($dbConfig['DB_NAME'])) {
        $dbPort = $dbConfig['DB_PORT'] ?? '3306';
        $dbHost = $dbConfig['DB_HOST'];
        $dbName = $dbConfig['DB_NAME'];
        $dbUser = $dbConfig['DB_USER'] ?? 'root';
        $dbPass = $dbConfig['DB_PASS'] ?? '';
        
        // Try with specified port first
        try {
            $dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";
            $pdo = new PDO($dsn, $dbUser, $dbPass);
            $diagnostics['checks']['database'] = [
                'status' => 'ok',
                'connected' => true,
                'host' => $dbHost,
                'port' => $dbPort,
                'database' => $dbName,
                'note' => 'Connected successfully with port ' . $dbPort
            ];
        } catch (PDOException $e) {
            $errorMsg = $e->getMessage();
            
            // If connection failed, try common alternative ports
            $alternativePorts = ['3306', '3307', '33060'];
            $connected = false;
            $workingPort = null;
            
            foreach ($alternativePorts as $altPort) {
                if ($altPort === $dbPort) continue; // Skip if already tried
                
                try {
                    $dsn = "mysql:host={$dbHost};port={$altPort};dbname={$dbName};charset=utf8mb4";
                    $pdo = new PDO($dsn, $dbUser, $dbPass);
                    $connected = true;
                    $workingPort = $altPort;
                    break;
                } catch (PDOException $e2) {
                    // Continue to next port
                }
            }
            
            if ($connected && $workingPort) {
                $diagnostics['checks']['database'] = [
                    'status' => 'warning',
                    'connected' => true,
                    'host' => $dbHost,
                    'configured_port' => $dbPort,
                    'working_port' => $workingPort,
                    'database' => $dbName,
                    'note' => "⚠️ Configured port ({$dbPort}) failed, but port {$workingPort} works! Update DB_PORT in .env"
                ];
            } else {
                $diagnostics['checks']['database'] = [
                    'status' => 'error',
                    'connected' => false,
                    'host' => $dbHost,
                    'port' => $dbPort,
                    'database' => $dbName,
                    'error' => $errorMsg,
                    'tried_ports' => array_merge([$dbPort], $alternativePorts),
                    'note' => 'Connection failed with all tried ports. Check DB credentials.'
                ];
            }
        }
    }
}

// Check 7: mod_rewrite (Apache only)
if (function_exists('apache_get_modules')) {
    $diagnostics['checks']['mod_rewrite'] = [
        'status' => in_array('mod_rewrite', apache_get_modules()) ? 'ok' : 'error',
        'enabled' => in_array('mod_rewrite', apache_get_modules())
    ];
} else {
    $diagnostics['checks']['mod_rewrite'] = [
        'status' => 'unknown',
        'note' => 'Cannot check mod_rewrite (not Apache or function not available)'
    ];
}

// Check 8: Path Extraction Test
$testPath = '/api/products/featured';
$requestUri = '/escwear.com/api/products/featured';
$scriptName = '/escwear.com/backend/public/index.php';
$basePath = str_replace('/index.php', '', $scriptName);

$extractedPath = $requestUri;
if (strpos($extractedPath, $basePath) === 0) {
    $extractedPath = substr($extractedPath, strlen($basePath));
}

// Try regex extraction
if (preg_match('#(/api/.*)$#', $requestUri, $matches)) {
    $extractedPath = $matches[1];
}

$diagnostics['checks']['path_extraction'] = [
    'status' => ($extractedPath === $testPath) ? 'ok' : 'warning',
    'request_uri' => $requestUri,
    'script_name' => $scriptName,
    'base_path' => $basePath,
    'extracted' => $extractedPath,
    'expected' => $testPath,
    'match' => ($extractedPath === $testPath)
];

// Summary
$errors = 0;
$warnings = 0;
foreach ($diagnostics['checks'] as $check) {
    if ($check['status'] === 'error') $errors++;
    if ($check['status'] === 'warning') $warnings++;
}

$diagnostics['summary'] = [
    'total_checks' => count($diagnostics['checks']),
    'errors' => $errors,
    'warnings' => $warnings,
    'overall_status' => $errors > 0 ? 'error' : ($warnings > 0 ? 'warning' : 'ok')
];

echo json_encode($diagnostics, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

