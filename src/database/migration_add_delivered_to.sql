-- Migration: Add delivered_to_user_id column to items table
-- This allows tracking which user received a found item from an admin

ALTER TABLE items ADD COLUMN delivered_to_user_id INT DEFAULT NULL;
ALTER TABLE items ADD CONSTRAINT fk_items_delivered_to_user 
    FOREIGN KEY (delivered_to_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- If you want to undo this migration, run:
-- ALTER TABLE items DROP FOREIGN KEY fk_items_delivered_to_user;
-- ALTER TABLE items DROP COLUMN delivered_to_user_id;
