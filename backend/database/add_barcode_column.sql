-- ============================================
-- Add Barcode Column to Products Table
-- ============================================

-- Add barcode column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS barcode VARCHAR(100) UNIQUE AFTER sku;

-- Add index for faster barcode lookups
CREATE INDEX IF NOT EXISTS idx_barcode ON products(barcode);

-- Generate barcodes for existing products that don't have one
-- Using EAN-13 format (13 digits) - starting with 622 (Egypt country code)
UPDATE products 
SET barcode = CONCAT('622', LPAD(id, 10, '0'))
WHERE barcode IS NULL OR barcode = '';

