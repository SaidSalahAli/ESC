-- ============================================
-- Shipping Governorates Table
-- ============================================
CREATE TABLE IF NOT EXISTS shipping_governorates (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    name_ar VARCHAR(100) NOT NULL UNIQUE,
    shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Insert Default Governorates (Egypt)
-- ============================================
INSERT INTO shipping_governorates (name, name_ar, shipping_cost, sort_order) VALUES
('Cairo', 'القاهرة', 50, 1),
('Giza', 'الجيزة', 50, 2),
('Alexandria', 'الإسكندرية', 50, 3),
('Beheira', 'البحيرة', 60, 4),
('Kafr El-Sheikh', 'كفر الشيخ', 60, 5),
('Damietta', 'دمياط', 60, 6),
('Dakahlia', 'الدقهلية', 60, 7),
('Menoufia', 'المنوفية', 60, 8),
('Qalyubia', 'القليوبية', 60, 9),
('Sharqia', 'الشرقية', 60, 10),
('Port Said', 'بورسعيد', 60, 11),
('Ismailia', 'الإسماعيلية', 60, 12),
('Suez', 'السويس', 60, 13),
('Beni Suef', 'بني سويف', 70, 14),
('Fayoum', 'الفيوم', 70, 15),
('Minya', 'المنيا', 70, 16),
('Assiut', 'أسيوط', 70, 17),
('Sohag', 'سوهاج', 70, 18),
('Qena', 'قنا', 70, 19),
('Luxor', 'الأقصر', 90, 20),
('Aswan', 'أسوان', 90, 21),
('Red Sea', 'البحر الأحمر', 90, 22),
('Matrouh', 'مطروح', 90, 23),
('New Valley', 'الوادي الجديد', 90, 24),
('North Sinai', 'شمال سيناء', 90, 25),
('South Sinai', 'جنوب سيناء', 90, 26);
