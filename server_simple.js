const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple API routes for testing
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'Backend API is running!',
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mock cars data
const mockCars = [
  {
    id: 1,
    brand: 'Toyota',
    model: 'Camry',
    year: 2023,
    pricePerDay: 45,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    image: '/api/placeholder/400/300',
    available: true
  },
  {
    id: 2,
    brand: 'Honda',
    model: 'Accord',
    year: 2023,
    pricePerDay: 50,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    image: '/api/placeholder/400/300',
    available: true
  },
  {
    id: 3,
    brand: 'BMW',
    model: 'X5',
    year: 2023,
    pricePerDay: 85,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 7,
    image: '/api/placeholder/400/300',
    available: true
  }
];

// Mock API endpoints
app.get('/api/cars', (req, res) => {
  res.json({
    success: true,
    message: 'Cars retrieved successfully',
    data: {
      cars: mockCars,
      pagination: {
        page: 1,
        limit: 10,
        total: mockCars.length,
        totalPages: 1
      }
    }
  });
});

app.get('/api/cars/:id', (req, res) => {
  const carId = parseInt(req.params.id);
  const car = mockCars.find(c => c.id === carId);
  
  if (car) {
    res.json({
      success: true,
      message: 'Car retrieved successfully',
      data: { car }
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Car not found'
    });
  }
});

// Mock auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@test.com' && password === 'password') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: 1,
          email: 'admin@test.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin'
        },
        token: 'mock-jwt-token-' + Date.now()
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Simple placeholder image endpoint
app.get('/api/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params;
  res.redirect(`https://via.placeholder.com/${width}x${height}/3B82F6/FFFFFF?text=Car+Image`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 Car Rental Backend API Started!');
  console.log('='.repeat(50));
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Mock cars API: http://localhost:${PORT}/api/cars`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎯 CORS origin: ${process.env.FRONTEND_URL || 'http://localhost:3001'}`);
  console.log('='.repeat(50));
  console.log('\n✅ Backend is ready to serve requests!\n');
});

module.exports = app;