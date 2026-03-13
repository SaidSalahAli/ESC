-- Add Google OAuth support to users table
ALTER TABLE users 
ADD COLUMN google_id VARCHAR(255) NULL UNIQUE AFTER password,
ADD COLUMN provider ENUM('local', 'google') DEFAULT 'local' AFTER google_id,
ADD INDEX idx_google_id (google_id);

