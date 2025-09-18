-- Car Rental System Database Schema
-- Created for MySQL 8.0+

-- Create database
CREATE DATABASE IF NOT EXISTS car_rental_db;
USE car_rental_db;

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Create users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Create cars table
CREATE TABLE cars (
    id INT PRIMARY KEY AUTO_INCREMENT,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    transmission ENUM('manual', 'automatic', 'cvt') NOT NULL,
    fuel_type ENUM('petrol', 'diesel', 'electric', 'hybrid') NOT NULL,
    seats INT NOT NULL CHECK (seats >= 2 AND seats <= 9),
    price_per_day DECIMAL(10, 2) NOT NULL CHECK (price_per_day > 0),
    description TEXT,
    features JSON,
    image_url VARCHAR(500),
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_brand_model (brand, model),
    INDEX idx_price (price_per_day),
    INDEX idx_status (status),
    INDEX idx_transmission (transmission),
    INDEX idx_fuel_type (fuel_type),
    UNIQUE KEY uk_license_plate (license_plate)
);

-- Create bookings table
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    car_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT GENERATED ALWAYS AS (DATEDIFF(end_date, start_date) + 1) STORED,
    daily_rate DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) GENERATED ALWAYS AS (total_days * daily_rate) STORED,
    status ENUM('pending', 'active', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_car_id (car_id),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    
    CONSTRAINT chk_date_range CHECK (end_date >= start_date),
    CONSTRAINT chk_future_dates CHECK (start_date >= CURDATE())
);

-- Create payments table
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    payment_method ENUM('credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    payment_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    
    INDEX idx_booking_id (booking_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_transaction_id (transaction_id)
);

-- Create reviews table
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    car_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    
    UNIQUE KEY uk_booking_review (booking_id),
    INDEX idx_user_id (user_id),
    INDEX idx_car_id (car_id),
    INDEX idx_rating (rating)
);

-- Create maintenance_logs table
CREATE TABLE maintenance_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    car_id INT NOT NULL,
    maintenance_type VARCHAR(100) NOT NULL,
    description TEXT,
    cost DECIMAL(10, 2) DEFAULT 0,
    maintenance_date DATE NOT NULL,
    next_maintenance_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    
    INDEX idx_car_id (car_id),
    INDEX idx_maintenance_date (maintenance_date),
    INDEX idx_next_maintenance (next_maintenance_date)
);

-- Create system_settings table
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_setting_key (setting_key)
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('site_name', 'Car Rental System', 'Name of the car rental system'),
('site_description', 'Modern car rental platform for easy vehicle booking', 'Site description'),
('default_booking_duration', '1', 'Default booking duration in days'),
('max_booking_duration', '30', 'Maximum booking duration in days'),
('advance_booking_days', '365', 'Maximum days in advance for booking'),
('cancellation_policy', '24', 'Cancellation policy in hours'),
('tax_rate', '0.10', 'Tax rate percentage'),
('late_return_fee', '50.00', 'Late return fee per day');

-- Create views for common queries
CREATE VIEW active_bookings AS
SELECT 
    b.id,
    b.start_date,
    b.end_date,
    b.total_amount,
    b.status,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    c.brand,
    c.model,
    c.license_plate,
    c.image_url
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN cars c ON b.car_id = c.id
WHERE b.status IN ('pending', 'active');

CREATE VIEW car_availability AS
SELECT 
    c.id,
    c.brand,
    c.model,
    c.year,
    c.transmission,
    c.fuel_type,
    c.seats,
    c.price_per_day,
    c.status,
    CASE 
        WHEN c.status != 'active' THEN 'unavailable'
        WHEN EXISTS (
            SELECT 1 FROM bookings b 
            WHERE b.car_id = c.id 
            AND b.status = 'active' 
            AND CURDATE() BETWEEN b.start_date AND b.end_date
        ) THEN 'rented'
        ELSE 'available'
    END AS availability_status
FROM cars c;

-- Create stored procedures
DELIMITER //

-- Procedure to check car availability for a date range
CREATE PROCEDURE CheckCarAvailability(
    IN car_id INT,
    IN start_date DATE,
    IN end_date DATE,
    OUT is_available BOOLEAN
)
BEGIN
    DECLARE conflict_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO conflict_count
    FROM bookings
    WHERE car_id = car_id
    AND status = 'active'
    AND (
        (start_date <= start_date AND end_date >= start_date) OR
        (start_date <= end_date AND end_date >= end_date) OR
        (start_date >= start_date AND end_date <= end_date)
    );
    
    SET is_available = (conflict_count = 0);
END //

-- Procedure to create a new booking
CREATE PROCEDURE CreateBooking(
    IN p_user_id INT,
    IN p_car_id INT,
    IN p_start_date DATE,
    IN p_end_date DATE,
    OUT booking_id INT,
    OUT success BOOLEAN,
    OUT message VARCHAR(255)
)
BEGIN
    DECLARE available BOOLEAN DEFAULT FALSE;
    DECLARE car_price DECIMAL(10,2);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET success = FALSE;
        SET message = 'Database error occurred';
    END;
    
    START TRANSACTION;
    
    -- Check if car exists and is active
    SELECT price_per_day INTO car_price
    FROM cars
    WHERE id = p_car_id AND status = 'active';
    
    IF car_price IS NULL THEN
        SET success = FALSE;
        SET message = 'Car not found or not available';
        ROLLBACK;
    ELSE
        -- Check availability
        CALL CheckCarAvailability(p_car_id, p_start_date, p_end_date, available);
        
        IF NOT available THEN
            SET success = FALSE;
            SET message = 'Car is not available for the selected dates';
            ROLLBACK;
        ELSE
            -- Create booking
            INSERT INTO bookings (user_id, car_id, start_date, end_date, daily_rate)
            VALUES (p_user_id, p_car_id, p_start_date, p_end_date, car_price);
            
            SET booking_id = LAST_INSERT_ID();
            SET success = TRUE;
            SET message = 'Booking created successfully';
            COMMIT;
        END IF;
    END IF;
END //

DELIMITER ;

-- Create triggers
DELIMITER //

-- Trigger to update car status based on bookings
CREATE TRIGGER update_booking_status
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    -- Update booking status to completed if end date has passed
    IF NEW.end_date < CURDATE() AND NEW.status = 'active' THEN
        UPDATE bookings 
        SET status = 'completed' 
        WHERE id = NEW.id;
    END IF;
END //

-- Trigger to log car maintenance
CREATE TRIGGER log_car_maintenance
AFTER UPDATE ON cars
FOR EACH ROW
BEGIN
    IF NEW.status = 'maintenance' AND OLD.status != 'maintenance' THEN
        INSERT INTO maintenance_logs (car_id, maintenance_type, description, maintenance_date)
        VALUES (NEW.id, 'Status Change', 'Car set to maintenance status', CURDATE());
    END IF;
END //

DELIMITER ;

-- Create indexes for performance
CREATE INDEX idx_bookings_date_range ON bookings (start_date, end_date);
CREATE INDEX idx_cars_price_range ON cars (price_per_day);
CREATE INDEX idx_users_created ON users (created_at);
CREATE INDEX idx_bookings_user_status ON bookings (user_id, status);

-- Add full-text search index for car descriptions
ALTER TABLE cars ADD FULLTEXT(brand, model, description);

-- Grant permissions (adjust as needed for your setup)
-- CREATE USER 'car_rental_user'@'localhost' IDENTIFIED BY 'secure_password_here';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON car_rental_db.* TO 'car_rental_user'@'localhost';
-- FLUSH PRIVILEGES;