-- ============================================
-- Create Views for ESC_Wear Database
-- ============================================

-- Product Reviews Statistics View
CREATE OR REPLACE VIEW v_product_reviews_stats AS
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

-- Top Selling Products View
CREATE OR REPLACE VIEW v_top_selling_products AS
SELECT 
    p.*,
    COALESCE(SUM(oi.quantity), 0) as total_sold
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id
WHERE o.status NOT IN ('cancelled', 'refunded')
    AND (o.payment_status = 'paid' OR (o.payment_method = 'cash_on_delivery' AND o.payment_status = 'pending'))
GROUP BY p.id
ORDER BY total_sold DESC;

