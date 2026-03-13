-- ============================================
-- ESC Wear - Multilingual & Images Update
-- ============================================

-- Add Arabic name and description to categories
ALTER TABLE categories
ADD COLUMN name_ar VARCHAR(255) NULL AFTER name,
ADD COLUMN description_ar TEXT NULL AFTER description;

-- Add Arabic fields to products
ALTER TABLE products
ADD COLUMN name_ar VARCHAR(255) NULL AFTER name,
ADD COLUMN description_ar TEXT NULL AFTER description,
ADD COLUMN brand_ar VARCHAR(100) NULL AFTER brand;

-- Update existing data with Arabic translations (you can update these later)
UPDATE categories SET name_ar = name WHERE name_ar IS NULL;
UPDATE products SET name_ar = name WHERE name_ar IS NULL;

-- Add main_image column to products (for primary product image)
ALTER TABLE products
ADD COLUMN main_image VARCHAR(255) NULL AFTER image;

-- Note: The 'image' column in categories already exists
-- Note: The 'product_images' table already exists for multiple product images

-- Create uploads directory structure info
-- You need to create these directories manually:
-- backend/public/uploads/
-- backend/public/uploads/products/
-- backend/public/uploads/categories/

SELECT 'Multilingual and Images columns added successfully!' AS status;

