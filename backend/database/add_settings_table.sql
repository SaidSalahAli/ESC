-- Create settings table for storing application-wide configuration
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    key VARCHAR(100) NOT NULL UNIQUE,
    value LONGTEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default shipping cost setting
INSERT INTO settings (key, value, type, description) VALUES 
('shipping_cost', '50', 'float', 'Default shipping cost in EGP');
