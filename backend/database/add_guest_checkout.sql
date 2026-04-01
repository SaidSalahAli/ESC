-- Add guest checkout support to orders table
ALTER TABLE orders 
ADD COLUMN is_guest BOOLEAN DEFAULT FALSE AFTER user_id,
ADD COLUMN guest_email VARCHAR(255) AFTER is_guest,
ADD COLUMN guest_phone VARCHAR(20) AFTER guest_email,
ADD COLUMN guest_name VARCHAR(255) AFTER guest_phone,
MODIFY user_id INT UNSIGNED NULL;

-- Create index for guest orders
CREATE INDEX idx_is_guest ON orders(is_guest);
CREATE INDEX idx_guest_email ON orders(guest_email);

-- Add unique constraint for guest order tracking (email + created_at)
ALTER TABLE orders ADD UNIQUE KEY unique_guest_order (guest_email, is_guest, created_at);

-- Add view token support for guest order tracking
ALTER TABLE orders ADD COLUMN view_token VARCHAR(64) UNIQUE AFTER guest_name;
CREATE INDEX idx_view_token ON orders(view_token);
