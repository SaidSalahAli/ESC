-- ============================================
-- ESC Wear - Sample Products for Testing
-- ============================================

-- Insert sample products (make sure you have categories first!)
-- If you don't have categories, uncomment and run these first:

/*
INSERT INTO categories (name, name_ar, slug, description, description_ar, is_active, sort_order) VALUES
('T-Shirts', 'تيشيرتات', 't-shirts', 'Comfortable and modest t-shirts', 'تيشيرتات مريحة ومحتشمة', TRUE, 1),
('Hoodies', 'هوديز', 'hoodies', 'Warm and stylish hoodies', 'هوديز دافئة وأنيقة', TRUE, 2),
('Pants', 'بناطيل', 'pants', 'Athletic and casual pants', 'بناطيل رياضية وكاجوال', TRUE, 3),
('Accessories', 'إكسسوارات', 'accessories', 'Complete your look', 'أكمل مظهرك', TRUE, 4);
*/

-- Sample Products
INSERT INTO products (name, name_ar, slug, description, description_ar, brand, brand_ar, price, category_id, stock_quantity, is_active, is_featured) VALUES
('Gym Ready Set', 'طقم جاهز للجيم', 'gym-ready-set', 'Perfect for your workout sessions. Comfortable and modest.', 'مثالي لجلسات التمرين. مريح ومحتشم.', 'ESC Wear', 'إي إس سي وير', 1800.00, 1, 50, TRUE, TRUE),

('Sports Hijab', 'حجاب رياضي', 'sports-hijab', 'Stay cool and covered during your workouts.', 'ابقي باردة ومغطاة أثناء التمرين.', 'ESC Wear', 'إي إس سي وير', 2000.00, 4, 100, TRUE, TRUE),

('Modest Athleisure Set', 'طقم أثليجر محتشم', 'modest-athleisure-set', 'Stylish and comfortable for everyday activities.', 'أنيق ومريح للأنشطة اليومية.', 'ESC Wear', 'إي إس سي وير', 2100.00, 1, 30, TRUE, TRUE),

('Premium Training Set', 'طقم تدريب بريميوم', 'premium-training-set', 'Elite performance wear for serious athletes.', 'ملابس أداء متميزة للرياضيين الجادين.', 'ESC Wear', 'إي إس سي وير', 2300.00, 1, 25, TRUE, TRUE),

('Active Lifestyle Hoodie', 'هودي لايف ستايل نشط', 'active-lifestyle-hoodie', 'Perfect blend of comfort and style.', 'مزيج مثالي من الراحة والأناقة.', 'ESC Wear', 'إي إس سي وير', 3250.00, 2, 40, TRUE, TRUE),

('Performance Hijab Pro', 'حجاب أداء برو', 'performance-hijab-pro', 'Advanced fabric technology for maximum comfort.', 'تقنية قماش متطورة لأقصى راحة.', 'ESC Wear', 'إي إس سي وير', 2200.00, 4, 75, TRUE, TRUE),

('Athletic Pants', 'بنطلون رياضي', 'athletic-pants', 'Flexible and durable for any activity.', 'مرن ومتين لأي نشاط.', 'ESC Wear', 'إي إس سي وير', 1950.00, 3, 60, TRUE, TRUE),

('Training Set Deluxe', 'طقم تدريب ديلوكس', 'training-set-deluxe', 'Complete set for your training needs.', 'طقم كامل لاحتياجات التدريب الخاصة بك.', 'ESC Wear', 'إي إس سي وير', 2800.00, 1, 35, TRUE, TRUE);

-- Update: Mark some products as NOT featured to test filtering
UPDATE products SET is_featured = FALSE WHERE slug IN ('athletic-pants', 'training-set-deluxe');

SELECT 'Sample products added successfully!' AS status;
SELECT COUNT(*) AS total_products FROM products;
SELECT COUNT(*) AS featured_products FROM products WHERE is_featured = TRUE;

