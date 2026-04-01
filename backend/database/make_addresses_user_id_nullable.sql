-- Make user_id nullable in addresses table to support guest orders
-- This allows storing guest shipping addresses without a user_id

ALTER TABLE `addresses` 
MODIFY COLUMN `user_id` int(10) UNSIGNED NULL,
ADD CONSTRAINT `fk_addresses_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
