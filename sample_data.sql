-- Sample Data for Car Rental System
-- Execute this after running schema.sql

USE car_rental_db;

-- Insert sample users (passwords are hashed for 'password123')
INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES
('admin@carrental.com', '$2a$12$8vHHKpEKzQjw8B4f9mCZ3Or3UBJjhN5TqNZCr8fQ9jg5F6QKzLkWq', 'Admin', 'User', '+1234567890', 'admin'),
('john.doe@email.com', '$2a$12$8vHHKpEKzQjw8B4f9mCZ3Or3UBJjhN5TqNZCr8fQ9jg5F6QKzLkWq', 'John', 'Doe', '+1234567891', 'customer'),
('jane.smith@email.com', '$2a$12$8vHHKpEKzQjw8B4f9mCZ3Or3UBJjhN5TqNZCr8fQ9jg5F6QKzLkWq', 'Jane', 'Smith', '+1234567892', 'customer'),
('mike.johnson@email.com', '$2a$12$8vHHKpEKzQjw8B4f9mCZ3Or3UBJjhN5TqNZCr8fQ9jg5F6QKzLkWq', 'Mike', 'Johnson', '+1234567893', 'customer'),
('sarah.wilson@email.com', '$2a$12$8vHHKpEKzQjw8B4f9mCZ3Or3UBJjhN5TqNZCr8fQ9jg5F6QKzLkWq', 'Sarah', 'Wilson', '+1234567894', 'customer');

-- Insert sample cars
INSERT INTO cars (brand, model, year, transmission, fuel_type, seats, price_per_day, description, features, license_plate, status) VALUES
('Toyota', 'Camry', 2023, 'automatic', 'hybrid', 5, 75.00, 'Reliable and fuel-efficient sedan perfect for business trips and family outings.', 
'["Air Conditioning", "Bluetooth", "Backup Camera", "Cruise Control", "USB Ports"]', 'ABC123', 'active'),

('Honda', 'CR-V', 2022, 'automatic', 'petrol', 5, 85.00, 'Spacious SUV with excellent safety ratings and comfortable ride quality.',
'["Air Conditioning", "Bluetooth", "Backup Camera", "All-Wheel Drive", "Sunroof", "Heated Seats"]', 'XYZ789', 'active'),

('BMW', 'X3', 2023, 'automatic', 'petrol', 5, 120.00, 'Luxury compact SUV with premium features and sporty performance.',
'["Premium Sound System", "Navigation", "Leather Seats", "Heated Seats", "Panoramic Sunroof", "Wireless Charging"]', 'BMW001', 'active'),

('Tesla', 'Model 3', 2023, 'automatic', 'electric', 5, 95.00, 'Electric sedan with cutting-edge technology and impressive range.',
'["Autopilot", "Premium Interior", "Supercharger Access", "Over-the-Air Updates", "Glass Roof"]', 'TSL100', 'active'),

('Ford', 'Explorer', 2022, 'automatic', 'petrol', 7, 90.00, 'Three-row SUV perfect for large families and group trips.',
'["Third Row Seating", "Towing Package", "Bluetooth", "Backup Camera", "Keyless Entry"]', 'FRD456', 'active'),

('Nissan', 'Altima', 2023, 'automatic', 'petrol', 5, 65.00, 'Comfortable midsize sedan with great fuel economy and modern features.',
'["Air Conditioning", "Bluetooth", "Apple CarPlay", "Android Auto", "Remote Start"]', 'NSN789', 'active'),

('Jeep', 'Wrangler', 2022, 'manual', 'petrol', 4, 100.00, 'Iconic off-road vehicle perfect for adventures and outdoor activities.',
'["4WD", "Removable Doors", "Convertible Top", "All-Terrain Tires", "Rock Rails"]', 'JEP200', 'active'),

('Mercedes-Benz', 'C-Class', 2023, 'automatic', 'petrol', 5, 110.00, 'Luxury sedan with elegant design and advanced safety features.',
'["Premium Sound System", "Navigation", "Leather Seats", "Heated/Cooled Seats", "Driver Assistance"]', 'MBZ300', 'active'),

('Hyundai', 'Elantra', 2022, 'automatic', 'petrol', 5, 55.00, 'Compact sedan offering great value with a comprehensive warranty.',
'["Air Conditioning", "Bluetooth", "Backup Camera", "Lane Keep Assist", "Forward Collision Warning"]', 'HYU400', 'active'),

('Chevrolet', 'Suburban', 2023, 'automatic', 'petrol', 8, 130.00, 'Full-size SUV with maximum cargo space and towing capability.',
'["Third Row Seating", "Premium Sound System", "Navigation", "Towing Package", "Power Liftgate"]', 'CHV500', 'active'),

('Audi', 'A4', 2023, 'automatic', 'petrol', 5, 105.00, 'Premium sedan combining performance with luxury and technology.',
'["Quattro AWD", "Virtual Cockpit", "Premium Sound", "Heated Seats", "Driver Assistance Package"]', 'AUD600', 'active'),

('Mazda', 'CX-5', 2022, 'automatic', 'petrol', 5, 80.00, 'Stylish crossover SUV with sporty handling and premium interior.',
'["All-Wheel Drive", "Apple CarPlay", "Android Auto", "Blind Spot Monitoring", "Heads-Up Display"]', 'MZD700', 'active');

-- Insert sample bookings (some in the past for completed status, some future for active/pending)
INSERT INTO bookings (user_id, car_id, start_date, end_date, daily_rate, status) VALUES
-- Completed bookings (past dates)
(2, 1, '2024-08-15', '2024-08-18', 75.00, 'completed'),
(3, 2, '2024-09-01', '2024-09-05', 85.00, 'completed'),
(4, 3, '2024-08-20', '2024-08-25', 120.00, 'completed'),

-- Active bookings (current dates)
(2, 4, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 DAY), 95.00, 'active'),
(5, 5, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 90.00, 'active'),

-- Pending bookings (future dates)
(3, 6, DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 8 DAY), 65.00, 'pending'),
(4, 7, DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 100.00, 'pending'),
(2, 8, DATE_ADD(CURDATE(), INTERVAL 20 DAY), DATE_ADD(CURDATE(), INTERVAL 23 DAY), 110.00, 'pending');

-- Insert sample payments
INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_id, payment_date) VALUES
(1, 300.00, 'credit_card', 'completed', 'TXN123456789', '2024-08-15 10:30:00'),
(2, 425.00, 'credit_card', 'completed', 'TXN123456790', '2024-09-01 14:20:00'),
(3, 720.00, 'paypal', 'completed', 'TXN123456791', '2024-08-20 09:15:00'),
(4, 380.00, 'credit_card', 'completed', 'TXN123456792', CURDATE()),
(5, 720.00, 'debit_card', 'completed', 'TXN123456793', CURDATE()),
(6, 260.00, 'credit_card', 'pending', NULL, NULL),
(7, 500.00, 'credit_card', 'pending', NULL, NULL),
(8, 440.00, 'paypal', 'pending', NULL, NULL);

-- Insert sample reviews for completed bookings
INSERT INTO reviews (booking_id, user_id, car_id, rating, comment) VALUES
(1, 2, 1, 5, 'Excellent car! Very reliable and fuel efficient. Perfect for my business trip.'),
(2, 3, 2, 4, 'Great SUV with lots of space. The ride was comfortable and the car was very clean.'),
(3, 4, 3, 5, 'Amazing luxury vehicle! The BMW was in perfect condition and a pleasure to drive.');

-- Insert sample maintenance logs
INSERT INTO maintenance_logs (car_id, maintenance_type, description, cost, maintenance_date, next_maintenance_date) VALUES
(1, 'Oil Change', 'Regular oil change and filter replacement', 65.00, '2024-08-01', '2024-11-01'),
(2, 'Tire Rotation', 'Rotated all four tires and checked pressure', 45.00, '2024-07-15', '2024-10-15'),
(3, 'Brake Inspection', 'Comprehensive brake system inspection', 120.00, '2024-08-10', '2025-02-10'),
(4, 'Software Update', 'Tesla over-the-air software update', 0.00, '2024-09-01', NULL),
(5, 'Oil Change', 'Regular maintenance service', 70.00, '2024-07-20', '2024-10-20');

-- Update some system settings with realistic values
UPDATE system_settings 
SET setting_value = CASE setting_key
    WHEN 'site_name' THEN 'Premium Car Rentals'
    WHEN 'site_description' THEN 'Your trusted partner for premium vehicle rentals'
    WHEN 'tax_rate' THEN '0.08'
    WHEN 'late_return_fee' THEN '75.00'
    ELSE setting_value
END
WHERE setting_key IN ('site_name', 'site_description', 'tax_rate', 'late_return_fee');

-- Create some additional useful data
-- Insert a few cancelled bookings for testing
INSERT INTO bookings (user_id, car_id, start_date, end_date, daily_rate, status, notes) VALUES
(3, 9, DATE_ADD(CURDATE(), INTERVAL 30 DAY), DATE_ADD(CURDATE(), INTERVAL 33 DAY), 55.00, 'cancelled', 'Customer cancelled due to change in travel plans'),
(5, 10, DATE_ADD(CURDATE(), INTERVAL 45 DAY), DATE_ADD(CURDATE(), INTERVAL 50 DAY), 130.00, 'cancelled', 'Cancelled and refunded due to vehicle maintenance');

-- Add corresponding refunded payments
INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_id, payment_date) VALUES
(9, 220.00, 'credit_card', 'refunded', 'TXN123456794', DATE_ADD(CURDATE(), INTERVAL 2 DAY)),
(10, 780.00, 'paypal', 'refunded', 'TXN123456795', DATE_ADD(CURDATE(), INTERVAL 3 DAY));

-- Add some cars in maintenance status
UPDATE cars SET status = 'maintenance' WHERE id IN (11, 12);

INSERT INTO maintenance_logs (car_id, maintenance_type, description, cost, maintenance_date, next_maintenance_date) VALUES
(11, 'Engine Repair', 'Major engine service and repair', 1200.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 180 DAY)),
(12, 'Transmission Service', 'Transmission fluid change and inspection', 350.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 90 DAY));

-- Verify data integrity
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Cars', COUNT(*) FROM cars
UNION ALL
SELECT 'Bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'Payments', COUNT(*) FROM payments
UNION ALL
SELECT 'Reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'Maintenance Logs', COUNT(*) FROM maintenance_logs
UNION ALL
SELECT 'System Settings', COUNT(*) FROM system_settings;