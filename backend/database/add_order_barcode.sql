-- ============================================
-- Add Barcode Column to Orders Table
-- ============================================

-- Add barcode column if it doesn't exist (using order_number as barcode)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS barcode VARCHAR(50) UNIQUE AFTER order_number;

-- Add index for faster barcode lookups
CREATE INDEX IF NOT EXISTS idx_order_barcode ON orders(barcode);

-- Set barcode = order_number for existing orders
UPDATE orders 
SET barcode = order_number
WHERE barcode IS NULL OR barcode = '';

-- Make sure order_number is used as barcode going forward
-- The Order model already generates order_number which will be used as barcode

