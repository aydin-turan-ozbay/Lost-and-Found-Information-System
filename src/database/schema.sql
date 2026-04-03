-- 1. Create and use the database
CREATE DATABASE IF NOT EXISTS lost_found_db;
USE lost_found_db;

-- 2. Drop existing tables to start fresh (Order is important due to Foreign Keys)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 3. Users Table
-- Removed: tc_no, lang
-- Added: Password length constraint (min 8 chars)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    student_id VARCHAR(50) NOT NULL UNIQUE, -- Your identifier
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'staff', 'academician', 'visitor', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Password length check (8 chars minimum)
    CONSTRAINT chk_password_length CHECK (CHAR_LENGTH(password) >= 8)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
USE lost_found_db;

CREATE TABLE `items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `color` VARCHAR(50) DEFAULT NULL,
  `location` VARCHAR(255) NOT NULL,
  `item_date` DATE NOT NULL,
  `description` TEXT,
  `status` ENUM('lost', 'found') DEFAULT 'lost',
  `image_path` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_items_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;