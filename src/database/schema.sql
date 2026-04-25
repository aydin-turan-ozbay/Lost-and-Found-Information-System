CREATE DATABASE IF NOT EXISTS lost_found_db;
USE lost_found_db;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'staff', 'academician', 'visitor', 'admin') DEFAULT 'student',
    security_question VARCHAR(255) NOT NULL, 
    security_answer VARCHAR(255) NOT NULL,   
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_password_length CHECK (CHAR_LENGTH(password) >= 8)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. ITEMS TABLE
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    category ENUM('electronic', 'wallet', 'bag', 'keychain', 'other') NOT NULL,
    color VARCHAR(50) DEFAULT NULL,
    location ENUM('bakırköy campus', 'gayrettepe campus', 'mahmutbey campus A block', 'mahmutbey campus D block') NOT NULL,
    item_date DATE NOT NULL,
    description TEXT,
    type ENUM('lost', 'found') NOT NULL, 
    status ENUM('active', 'delivered', 'archived') DEFAULT 'active',
    image_path VARCHAR(255) DEFAULT NULL,
    delivered_to_user_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_items_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_items_delivered_to_user FOREIGN KEY (delivered_to_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

