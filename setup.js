const mysql = require('mysql2/promise');
const { execSync } = require('child_process');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'car_rental_test_db';

// Global test utilities
global.testDb = null;

// Database setup and cleanup utilities
global.setupTestDb = async () => {
  try {
    // Create test database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 3306
    });

    // Create test database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.execute(`USE ${process.env.DB_NAME}`);

    // Run migrations
    try {
      execSync('npm run migrate', { stdio: 'pipe' });
    } catch (error) {
      console.warn('Migration script not found, skipping...');
    }

    global.testDb = connection;
    return connection;
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
};

global.cleanupTestDb = async () => {
  if (global.testDb) {
    try {
      // Clean up all tables
      const tables = [
        'reviews',
        'payments', 
        'bookings',
        'maintenance_logs',
        'cars',
        'users',
        'system_settings'
      ];

      await global.testDb.execute('SET FOREIGN_KEY_CHECKS = 0');
      
      for (const table of tables) {
        try {
          await global.testDb.execute(`TRUNCATE TABLE ${table}`);
        } catch (error) {
          // Table might not exist, continue
          console.warn(`Could not truncate table ${table}:`, error.message);
        }
      }
      
      await global.testDb.execute('SET FOREIGN_KEY_CHECKS = 1');
    } catch (error) {
      console.error('Error cleaning up test database:', error);
    }
  }
};

global.closeTestDb = async () => {
  if (global.testDb) {
    await global.testDb.end();
    global.testDb = null;
  }
};

// Mock console.log and console.error to reduce test noise
const originalConsole = { ...console };
global.mockConsole = () => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
};

global.restoreConsole = () => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
};

// Test data factories
global.createTestUser = (overrides = {}) => {
  return {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    phone: '1234567890',
    role: 'customer',
    ...overrides
  };
};

global.createTestCar = (overrides = {}) => {
  return {
    brand: 'Toyota',
    model: 'Camry',
    year: 2022,
    transmission: 'automatic',
    fuelType: 'petrol',
    seats: 5,
    pricePerDay: 50.00,
    description: 'A reliable and comfortable sedan',
    features: ['air_conditioning', 'gps', 'bluetooth'],
    licensePlate: 'ABC123',
    status: 'active',
    ...overrides
  };
};

global.createTestBooking = (overrides = {}) => {
  return {
    userId: 1,
    carId: 1,
    startDate: '2024-01-15',
    endDate: '2024-01-20',
    dailyRate: 50.00,
    status: 'pending',
    ...overrides
  };
};

// JWT test utilities
global.generateTestToken = (payload = {}) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: 1, email: 'test@example.com', role: 'customer', ...payload },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

// API test utilities
global.makeAuthRequest = (app, token) => {
  const request = require('supertest');
  return request(app).set('Authorization', `Bearer ${token}`);
};

// Date utilities for testing
global.getTestDateRange = (daysFromNow = 7) => {
  const start = new Date();
  start.setDate(start.getDate() + 1); // Tomorrow
  
  const end = new Date(start);
  end.setDate(end.getDate() + daysFromNow);
  
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0]
  };
};

// Set longer timeout for database operations
jest.setTimeout(30000);

console.log('Test setup loaded successfully');