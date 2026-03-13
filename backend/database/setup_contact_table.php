<?php
/**
 * Setup Contact Messages Table
 * Run this file once to create the contact_messages table
 * URL: https://localhost/ESC_Wear/backend/database/setup_contact_table.php
 */

header('Content-Type: text/html; charset=utf-8');

// Define ROOT_PATH
define('ROOT_PATH', dirname(__DIR__));

// Load environment variables from .env file
$envFile = ROOT_PATH . '/.env';
$dbConfig = [
    'host' => 'localhost',
    'port' => '3306',
    'name' => 'esc_wear',
    'user' => 'root',
    'password' => '',
    'charset' => 'utf8mb4',
];

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
        
        // Split by '='
        $parts = explode('=', $line, 2);
        if (count($parts) !== 2) {
            continue;
        }
        
        $name = trim($parts[0]);
        $value = trim($parts[1] ?? '');
        
        // Map to database config
        switch ($name) {
            case 'DB_HOST':
                $dbConfig['host'] = $value;
                break;
            case 'DB_PORT':
                $dbConfig['port'] = $value;
                break;
            case 'DB_NAME':
                $dbConfig['name'] = $value;
                break;
            case 'DB_USER':
                $dbConfig['user'] = $value;
                break;
            case 'DB_PASS':
                $dbConfig['password'] = $value;
                break;
        }
    }
}

try {
    // Connect to database
    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=%s',
        $dbConfig['host'],
        $dbConfig['port'],
        $dbConfig['name'],
        $dbConfig['charset']
    );
    
    $pdo = new PDO($dsn, $dbConfig['user'], $dbConfig['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    
    // Check if table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'contact_messages'");
    $tableExists = $stmt->rowCount() > 0;
    
    if ($tableExists) {
        echo "<h2>✅ Table 'contact_messages' already exists!</h2>";
        echo "<p>The table is ready to use.</p>";
    } else {
        // Create table
        $sql = "
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            subject VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
            user_id INT UNSIGNED NULL,
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
            INDEX idx_status (status),
            INDEX idx_created_at (created_at),
            INDEX idx_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        $pdo->exec($sql);
        
        echo "<h2>✅ Table 'contact_messages' created successfully!</h2>";
        echo "<p>The contact system is now ready to use.</p>";
    }
    
    // Show table structure
    echo "<h3>Table Structure:</h3>";
    $stmt = $pdo->query("DESCRIBE contact_messages");
    $columns = $stmt->fetchAll();
    
    echo "<table border='1' cellpadding='10' style='border-collapse: collapse;'>";
    echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th></tr>";
    foreach ($columns as $column) {
        echo "<tr>";
        echo "<td>{$column['Field']}</td>";
        echo "<td>{$column['Type']}</td>";
        echo "<td>{$column['Null']}</td>";
        echo "<td>{$column['Key']}</td>";
        echo "<td>{$column['Default']}</td>";
        echo "</tr>";
    }
    echo "</table>";
    
} catch (PDOException $e) {
    echo "<h2>❌ Error:</h2>";
    echo "<p style='color: red;'>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p>Error Code: " . $e->getCode() . "</p>";
} catch (Exception $e) {
    echo "<h2>❌ Error:</h2>";
    echo "<p style='color: red;'>" . htmlspecialchars($e->getMessage()) . "</p>";
}

