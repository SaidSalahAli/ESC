<?php

/**
 * Application Configuration
 */

// Load environment variables from .env file
$envFile = ROOT_PATH . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);

        // Skip empty lines and comments
        if (empty($line) || strpos($line, '#') === 0) {
            continue;
        }

        // Check if line contains '='
        if (strpos($line, '=') === false) {
            continue;
        }

        // Split by '=' only if it exists
        $parts = explode('=', $line, 2);
        if (count($parts) !== 2) {
            continue;
        }

        $name = trim($parts[0]);
        $value = trim($parts[1] ?? '');

        // Skip if name is empty
        if (empty($name)) {
            continue;
        }

        if (!array_key_exists($name, $_ENV)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
        }
    }
}

// Helper function to get environment variables
if (!function_exists('env')) {
    function env($key, $default = null)
    {
        $value = getenv($key);
        if ($value === false) {
            return $default;
        }
        return $value;
    }
}

// Application Configuration
return [
    'app' => [
        'name' => 'ESC Wear Backend',
        'env' => env('APP_ENV', 'production'),
        'debug' => env('APP_DEBUG', 'false') === 'true',
        'url' => env('APP_URL', 'http://localhost'),
        'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),
    ],

    'database' => [
        'host' => env('DB_HOST', 'localhost'),
        'port' => env('DB_PORT', '3306'),
        'name' => env('DB_NAME', 'u653985312_esc_wea'),
        'user' => env('DB_USER', 'root'),
        'pass' => env('DB_PASS', ''),
        'charset' => 'utf8mb4',
    ],

    'jwt' => [
        'secret' => env('JWT_SECRET', 'change-this-secret-key'),
        'expiration' => (int)env('JWT_EXPIRATION', 3600),
        'refresh_expiration' => (int)env('JWT_REFRESH_EXPIRATION', 604800),
    ],

    'cib_payment' => [
        'merchant_id' => env('CIB_MERCHANT_ID', ''),
        'secure_hash' => env('CIB_SECURE_HASH', ''),
        'api_url' => env('CIB_API_URL', ''),
        'return_url' => env('CIB_RETURN_URL', ''),
        'cancel_url' => env('CIB_CANCEL_URL', ''),
        'currency' => 'EGP',
    ],

    'security' => [
        'csrf_token_expiration' => (int)env('CSRF_TOKEN_EXPIRATION', 7200),
        'password_hash_algo' => PASSWORD_BCRYPT,
        'password_cost' => (int)env('PASSWORD_COST', 12),
    ],

    'upload' => [
        'max_file_size' => (int)env('MAX_FILE_SIZE', 5242880), // 5MB
        'allowed_extensions' => explode(',', env('ALLOWED_EXTENSIONS', 'jpg,jpeg,png,gif,webp')),
        'upload_path' => PUBLIC_PATH . '/' . env('UPLOAD_PATH', 'uploads/'),
    ],

    // Mail configuration (used by EmailService)
    'mail' => [
        'host' => env('MAIL_HOST', 'smtp.gmail.com'),
        'username' => env('MAIL_USERNAME', ''),
        'password' => env('MAIL_PASSWORD', ''),
        'port' => (int)env('MAIL_PORT', 587),
        'encryption' => env('MAIL_ENCRYPTION', 'tls'), // tls or ssl
        'from_address' => env('MAIL_FROM_ADDRESS', 'no-reply@example.com'),
        'from_name' => env('MAIL_FROM_NAME', 'ESC Wear'),
    ],

    'pagination' => [
        'items_per_page' => (int)env('ITEMS_PER_PAGE', 20),
    ],
];
