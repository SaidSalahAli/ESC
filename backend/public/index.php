<?php
/**
 * ESC_Wear Backend - Main Entry Point
 * HOSTINGER FIXED VERSION
 */

// ========================================
// ERROR REPORTING (مؤقتًا للتصحيح)
// ========================================
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// ========================================
// TIMEZONE
// ========================================
date_default_timezone_set('Africa/Cairo');

// ========================================
// SESSION
// ========================================
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);

if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
    ini_set('session.cookie_secure', 1);
}

session_start();

// ========================================
// DEFINE PATHS
// ========================================
// index.php داخل backend/public
// فنطلع خطوة لفوق عشان نوصل لـ backend

define('ROOT_PATH', dirname(__DIR__)); // backend
define('APP_PATH', ROOT_PATH . '/app');
define('PUBLIC_PATH', __DIR__);

// ========================================
// LOAD COMPOSER
// ========================================
$composerPath = ROOT_PATH . '/vendor/autoload.php';

if (!file_exists($composerPath)) {
    die(json_encode([
        'success' => false,
        'message' => 'Composer autoload not found',
        'path_checked' => $composerPath
    ]));
}

require_once $composerPath;

// ========================================
// LOAD PROJECT AUTOLOADER
// ========================================
$autoloaderPath = APP_PATH . '/helpers/Autoloader.php';

if (!file_exists($autoloaderPath)) {
    die(json_encode([
        'success' => false,
        'message' => 'Autoloader file missing',
        'path_checked' => $autoloaderPath
    ]));
}

require_once $autoloaderPath;
spl_autoload_register(['Autoloader', 'load']);

// ========================================
// LOAD CONFIG
// ========================================
$configPath = APP_PATH . '/config/config.php';

if (!file_exists($configPath)) {
    die(json_encode([
        'success' => false,
        'message' => 'Config file missing',
        'path_checked' => $configPath
    ]));
}

$config = require_once $configPath;

// ========================================
// CORS (مؤقتًا مفتوح للتجربة)
// ========================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ========================================
// ROUTER
// ========================================
use App\Core\Router;
use App\Core\Request;

try {

    if (!class_exists('App\Core\Router')) {
        throw new Exception('Router class not found after autoload.');
    }

    // 🔥 ننشئ الروتر الأول
    $router = new Router();

    $routesFile = ROOT_PATH . '/routes/api.php';

    if (!file_exists($routesFile)) {
        throw new Exception('Routes file not found at: ' . $routesFile);
    }

    // 🔥 ندخل الروتر داخل routes scope بشكل نظيف
    (function ($router) use ($routesFile) {
        require $routesFile;
    })($router);

    $request = new Request();
    $router->dispatch($request);

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error_message' => $e->getMessage(),
        'error_file' => $e->getFile(),
        'error_line' => $e->getLine()
    ]);
}
