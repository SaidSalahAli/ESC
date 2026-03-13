<?php
/**
 * Fix View Definers Script
 * 
 * This script fixes the "definer does not exist" error by recreating
 * database views and stored procedures with CURRENT_USER as definer.
 * 
 * Usage: php fix_view_definers.php
 */

// Define ROOT_PATH
define('ROOT_PATH', dirname(__DIR__));
define('PUBLIC_PATH', ROOT_PATH . '/public');

// Load config
$config = require __DIR__ . '/../app/config/config.php';
$dbConfig = $config['database'];

try {
    // Connect to database
    $dsn = sprintf(
        'mysql:host=%s;port=%s;charset=%s',
        $dbConfig['host'],
        $dbConfig['port'],
        $dbConfig['charset']
    );
    
    $pdo = new PDO($dsn, $dbConfig['user'], $dbConfig['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    
    // Select database
    $pdo->exec("USE `{$dbConfig['name']}`");
    
    echo "Connected to database: {$dbConfig['name']}\n";
    echo "Fixing view definers...\n\n";
    
    // Drop existing views
    echo "Dropping existing views...\n";
    $pdo->exec("DROP VIEW IF EXISTS v_top_selling_products");
    $pdo->exec("DROP VIEW IF EXISTS v_recent_orders");
    $pdo->exec("DROP VIEW IF EXISTS v_sales_statistics");
    $pdo->exec("DROP VIEW IF EXISTS v_product_reviews_stats");
    echo "✓ Views dropped\n\n";
    
    // Drop stored procedures
    echo "Dropping existing stored procedures...\n";
    $pdo->exec("DROP PROCEDURE IF EXISTS sp_get_top_selling_products");
    $pdo->exec("DROP PROCEDURE IF EXISTS sp_monthly_sales_report");
    $pdo->exec("DROP PROCEDURE IF EXISTS sp_update_product_sales_count");
    echo "✓ Stored procedures dropped\n\n";
    
    // Recreate views
    echo "Recreating views with CURRENT_USER definer...\n";
    
    // Top selling products view
    $pdo->exec("
        CREATE DEFINER = CURRENT_USER VIEW v_top_selling_products AS
        SELECT 
            p.id,
            p.name,
            p.slug,
            p.main_image,
            p.price,
            p.sales_count,
            COUNT(DISTINCT o.id) as total_orders,
            SUM(oi.quantity) as total_quantity_sold,
            SUM(oi.subtotal) as total_revenue
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN orders o ON oi.order_id = o.id
        WHERE o.payment_status = 'paid'
        GROUP BY p.id
        ORDER BY p.sales_count DESC, total_revenue DESC
    ");
    echo "✓ Created v_top_selling_products\n";
    
    // Recent orders view
    $pdo->exec("
        CREATE DEFINER = CURRENT_USER VIEW v_recent_orders AS
        SELECT 
            o.id,
            o.order_number,
            o.status,
            o.payment_status,
            o.total,
            o.created_at,
            u.first_name,
            u.last_name,
            u.email,
            COUNT(oi.id) as total_items
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
    ");
    echo "✓ Created v_recent_orders\n";
    
    // Sales statistics view
    $pdo->exec("
        CREATE DEFINER = CURRENT_USER VIEW v_sales_statistics AS
        SELECT 
            DATE(o.created_at) as sale_date,
            COUNT(DISTINCT o.id) as total_orders,
            SUM(o.total) as total_revenue,
            AVG(o.total) as average_order_value,
            SUM(oi.quantity) as total_items_sold
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.payment_status = 'paid'
        GROUP BY DATE(o.created_at)
        ORDER BY sale_date DESC
    ");
    echo "✓ Created v_sales_statistics\n";
    
    // Product reviews statistics view
    $pdo->exec("
        CREATE DEFINER = CURRENT_USER VIEW v_product_reviews_stats AS
        SELECT 
            p.id as product_id,
            p.name as product_name,
            COUNT(r.id) as total_reviews,
            COALESCE(AVG(r.rating), 0) as average_rating,
            SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) as five_star,
            SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) as four_star,
            SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) as three_star,
            SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) as two_star,
            SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) as one_star
        FROM products p
        LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = 1
        GROUP BY p.id, p.name
    ");
    echo "✓ Created v_product_reviews_stats\n\n";
    
    // Recreate stored procedures
    echo "Recreating stored procedures with CURRENT_USER definer...\n";
    
    // Get top selling products procedure
    $pdo->exec("
        CREATE DEFINER = CURRENT_USER PROCEDURE sp_get_top_selling_products(IN limit_count INT)
        BEGIN
            SELECT * FROM v_top_selling_products LIMIT limit_count;
        END
    ");
    echo "✓ Created sp_get_top_selling_products\n";
    
    // Monthly sales report procedure
    $pdo->exec("
        CREATE DEFINER = CURRENT_USER PROCEDURE sp_monthly_sales_report(IN year INT, IN month INT)
        BEGIN
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as orders_count,
                SUM(total) as total_sales
            FROM orders
            WHERE YEAR(created_at) = year 
                AND MONTH(created_at) = month
                AND payment_status = 'paid'
            GROUP BY DATE(created_at)
            ORDER BY date;
        END
    ");
    echo "✓ Created sp_monthly_sales_report\n";
    
    // Update product sales count procedure
    $pdo->exec("
        CREATE DEFINER = CURRENT_USER PROCEDURE sp_update_product_sales_count(IN product_id INT)
        BEGIN
            UPDATE products 
            SET sales_count = (
                SELECT COALESCE(SUM(oi.quantity), 0)
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                WHERE oi.product_id = product_id 
                    AND o.payment_status = 'paid'
            )
            WHERE id = product_id;
        END
    ");
    echo "✓ Created sp_update_product_sales_count\n\n";
    
    echo "✅ All views and stored procedures have been recreated successfully!\n";
    echo "The definer issue should now be fixed.\n";
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}

