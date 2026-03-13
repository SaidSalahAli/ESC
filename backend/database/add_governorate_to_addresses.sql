-- ============================================
-- Add Governorate Column to Addresses Table
-- ============================================

-- Add governorate column if it doesn't exist
ALTER TABLE addresses ADD COLUMN governorate VARCHAR(100) AFTER state;

-- Create index for faster lookups (use IF NOT EXISTS for safety)
ALTER TABLE addresses ADD INDEX idx_governorate (governorate);
