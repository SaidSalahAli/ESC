-- ============================================
-- Add Order Fulfillment Support
-- ============================================

-- Add scanned_quantity column to order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS scanned_quantity INT DEFAULT 0 AFTER quantity;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

