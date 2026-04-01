-- Add order_returns table for partial order returns
USE esc_wear;

CREATE TABLE IF NOT EXISTS order_returns (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL,
    order_item_id INT UNSIGNED NOT NULL,
    quantity INT NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected', 'refunded') DEFAULT 'pending',
    scanned_barcodes TEXT, -- JSON array of scanned barcodes for this return
    refund_amount DECIMAL(10, 2) DEFAULT 0.00,
    created_by INT UNSIGNED, -- Admin user who created the return
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_order_id (order_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;







