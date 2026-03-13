-- Add customer contact columns to addresses table (idempotent)
ALTER TABLE addresses
    ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) NULL AFTER user_id;

ALTER TABLE addresses
    ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) NULL AFTER first_name;

ALTER TABLE addresses
    ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL AFTER last_name;

-- Backfill missing data from users table where possible
UPDATE addresses a
JOIN users u ON a.user_id = u.id
SET
    a.first_name = COALESCE(a.first_name, u.first_name),
    a.last_name = COALESCE(a.last_name, u.last_name),
    a.phone = COALESCE(a.phone, u.phone)
WHERE
    a.first_name IS NULL
    OR a.last_name IS NULL
    OR a.phone IS NULL;
