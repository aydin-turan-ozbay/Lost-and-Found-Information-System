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
    is_verified TINYINT(1) DEFAULT 0, -- For OTP approval
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
        -- Password length check (8 chars minimum)
    CONSTRAINT chk_password_length CHECK (CHAR_LENGTH(password) >= 8)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. ITEMS TABLE
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    category ENUM('electronic', 'wallet/card holder', 'bag', 'keychain', 'other') NOT NULL,
    color VARCHAR(50) DEFAULT NULL,
    location ENUM('bakırköy campus', 'gayrettepe campus', 'mahmutbey campus A block', 'mahmutbey campus D block') NOT NULL,
    item_date DATE NOT NULL,
    description TEXT,
    type ENUM('lost', 'found') NOT NULL,
    status ENUM('active', 'delivered', 'archived') DEFAULT 'active',
    image_path VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_items_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. OTP_CODES TABLE
CREATE TABLE IF NOT EXISTS otp_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    otp_code CHAR(6) NOT NULL, 
    type ENUM('registration', 'password_reset') NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_otp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. MATCHES TABLE
CREATE TABLE IF NOT EXISTS matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lost_item_id INT NOT NULL,
    found_item_id INT NOT NULL,
    match_score DECIMAL(5,2) NOT NULL,
    is_notified TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_different_items CHECK (lost_item_id <> found_item_id),
    UNIQUE KEY unique_match_pair (lost_item_id, found_item_id),
    CONSTRAINT fk_lost_item FOREIGN KEY (lost_item_id) REFERENCES items(id) ON DELETE CASCADE,
    CONSTRAINT fk_found_item FOREIGN KEY (found_item_id) REFERENCES items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;