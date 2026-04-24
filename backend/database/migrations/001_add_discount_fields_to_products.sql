-- Add discount fields to products table
-- Date: 2026-04-24

ALTER TABLE products
ADD COLUMN discount_type ENUM('none','percentage','fixed') NOT NULL DEFAULT 'none' AFTER sale_price,
ADD COLUMN discount_value DECIMAL(10,2) NULL AFTER discount_type,
ADD COLUMN discount_start_at DATETIME NULL AFTER discount_value,
ADD COLUMN discount_end_at DATETIME NULL AFTER discount_start_at,
ADD COLUMN is_discount_active TINYINT(1) NOT NULL DEFAULT 0 AFTER discount_end_at;

-- Add indexes for better query performance
CREATE INDEX idx_products_discount_active ON products(is_discount_active);
CREATE INDEX idx_products_discount_dates ON products(discount_start_at, discount_end_at);

-- Commit changes
COMMIT;
