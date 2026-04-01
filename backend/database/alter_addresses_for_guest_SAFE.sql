-- Alternative migration for addresses table - supports guest addresses
-- Use this if the previous migration fails due to foreign key name issues

-- Option 1: If you know the exact foreign key constraint name, use:
-- ALTER TABLE addresses DROP FOREIGN KEY your_constraint_name;

-- Option 2: Safe approach - rebuild the constraint
-- This will work regardless of the current constraint name

-- First check the current state (informational):
-- SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
-- WHERE TABLE_NAME = 'addresses' AND COLUMN_NAME = 'user_id' AND REFERENCED_TABLE_NAME = 'users';

-- If the above shows the constraint exists, drop it first:
-- Typical constraint names are: addresses_ibfk_1, addresses_user_id_foreign, fk_addresses_user_id

-- Safe method - modify the column to allow NULL first, then fix the constraint:
ALTER TABLE addresses MODIFY user_id INT UNSIGNED NULL;

-- If there's an existing foreign key, try to drop it with the most common name:
-- ALTER TABLE addresses DROP FOREIGN KEY addresses_ibfk_1;
-- Or try:
-- ALTER TABLE addresses DROP FOREIGN KEY addresses_user_id_foreign;

-- If the above fails, you may need to drop it manually via phpMyAdmin or check the exact name

-- After removing the old constraint, add the new one:
-- ALTER TABLE addresses 
-- ADD CONSTRAINT addresses_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
