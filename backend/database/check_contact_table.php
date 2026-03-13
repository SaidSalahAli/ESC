<?php
/**
 * Check if contact_messages table exists
 * Run this file to verify the table exists
 */

require __DIR__ . '/../app/config/config.php';

try {
    $db = new PDO(
        "mysql:host={$config['database']['host']};dbname={$config['database']['name']};charset={$config['database']['charset']}",
        $config['database']['user'],
        $config['database']['pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
    
    // Check if table exists
    $stmt = $db->query("SHOW TABLES LIKE 'contact_messages'");
    $tableExists = $stmt->rowCount() > 0;
    
    if ($tableExists) {
        echo "✅ Table 'contact_messages' exists!\n\n";
        
        // Show table structure
        echo "Table structure:\n";
        $stmt = $db->query("DESCRIBE contact_messages");
        $columns = $stmt->fetchAll();
        foreach ($columns as $column) {
            echo "  - {$column['Field']} ({$column['Type']})\n";
        }
        
        // Count messages
        $stmt = $db->query("SELECT COUNT(*) as count FROM contact_messages");
        $count = $stmt->fetch()['count'];
        echo "\nTotal messages: {$count}\n";
    } else {
        echo "❌ Table 'contact_messages' does NOT exist!\n";
        echo "Please run: backend/database/create_contact_messages_table.sql\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Database Error: " . $e->getMessage() . "\n";
    echo "Error Code: " . $e->getCode() . "\n";
}






