-- Modify addresses table to support guest addresses with NULL user_id
-- This allows guest orders to have addresses without requiring a user account

-- Step 1: Get the foreign key constraint name (run this to find it):
-- SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
-- WHERE TABLE_NAME = 'addresses' AND COLUMN_NAME = 'user_id' AND REFERENCED_TABLE_NAME = 'users' AND TABLE_SCHEMA = DATABASE();

-- Step 2: Modify the column to allow NULL
ALTER TABLE addresses 
MODIFY COLUMN user_id INT UNSIGNED NULL;

-- Step 3: If there's an existing foreign key constraint, drop it
-- Replace 'fk_name_here' with the actual constraint name from Step 1
-- Uncomment the line below and replace fk_name_here:
-- ALTER TABLE addresses DROP FOREIGN KEY fk_name_here;

-- Step 4: Add new foreign key with ON DELETE SET NULL (optional, for data integrity)
-- Uncomment if you dropped the old constraint:
-- ALTER TABLE addresses 
-- ADD CONSTRAINT fk_addresses_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
