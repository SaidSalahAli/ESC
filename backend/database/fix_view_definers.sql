-- ============================================
-- Fix View Definers for ESC_Wear Database
-- This script fixes the "definer does not exist" error
-- by recreating views with CURRENT_USER as definer
-- ============================================

USE esc_wear;

-- Drop existing views if they exist
DROP VIEW IF EXISTS v_top_selling_products;
DROP VIEW IF EXISTS v_recent_orders;
DROP VIEW IF EXISTS v_sales_statistics;
DROP VIEW IF EXISTS v_product_reviews_stats;

-- Drop stored procedures if they exist
DROP PROCEDURE IF EXISTS sp_get_top_selling_products;
DROP PROCEDURE IF EXISTS sp_monthly_sales_report;
DROP PROCEDURE IF EXISTS sp_update_product_sales_count;

-- ============================================
-- Recreate Views with CURRENT_USER as definer
-- ============================================

-- Top selling products view
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
ORDER BY p.sales_count DESC, total_revenue DESC;

-- Recent orders view
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
ORDER BY o.created_at DESC;

-- Sales statistics view
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
ORDER BY sale_date DESC;

-- Product reviews statistics view
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
GROUP BY p.id, p.name;

-- ============================================
-- Recreate Stored Procedures with CURRENT_USER as definer
-- ============================================

DELIMITER $$

-- Get top selling products
CREATE DEFINER = CURRENT_USER PROCEDURE sp_get_top_selling_products(IN limit_count INT)
BEGIN
    SELECT * FROM v_top_selling_products LIMIT limit_count;
END$$

-- Get monthly sales report
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
END$$

-- Update product sales count
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
END$$

DELIMITER ;







