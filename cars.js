const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Joi = require('joi');
const Car = require('../models/Car');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/cars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'car-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Validation schema
const carSchema = Joi.object({
  brand: Joi.string().min(2).max(50).required(),
  model: Joi.string().min(2).max(50).required(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
  transmission: Joi.string().valid('manual', 'automatic', 'cvt').required(),
  fuelType: Joi.string().valid('petrol', 'diesel', 'electric', 'hybrid').required(),
  seats: Joi.number().integer().min(2).max(9).required(),
  pricePerDay: Joi.number().positive().required(),
  description: Joi.string().max(1000).optional(),
  features: Joi.array().items(Joi.string()).optional(),
  licensePlate: Joi.string().min(3).max(20).required()
});

// Get all cars with optional filters
router.get('/', async (req, res) => {
  try {
    const filters = {
      brand: req.query.brand,
      model: req.query.model,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
      transmission: req.query.transmission,
      fuelType: req.query.fuelType,
      availableOnly: req.query.availableOnly === 'true'
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => 
      filters[key] === undefined && delete filters[key]
    );

    const cars = await Car.getAll(filters);
    
    // Parse features JSON for each car
    const carsWithParsedFeatures = cars.map(car => ({
      ...car,
      features: car.features ? JSON.parse(car.features) : []
    }));

    res.json({
      message: 'Cars retrieved successfully',
      count: carsWithParsedFeatures.length,
      cars: carsWithParsedFeatures
    });
  } catch (error) {
    console.error('Get cars error:', error);
    res.status(500).json({
      message: 'Failed to retrieve cars',
      error: error.message
    });
  }
});

// Get single car by ID
router.get('/:id', async (req, res) => {
  try {
    const carId = parseInt(req.params.id);
    
    if (isNaN(carId)) {
      return res.status(400).json({
        message: 'Invalid car ID'
      });
    }

    const car = await Car.findById(carId);
    
    if (!car) {
      return res.status(404).json({
        message: 'Car not found'
      });
    }

    // Parse features JSON
    car.features = car.features ? JSON.parse(car.features) : [];

    res.json({
      message: 'Car retrieved successfully',
      car
    });
  } catch (error) {
    console.error('Get car error:', error);
    res.status(500).json({
      message: 'Failed to retrieve car',
      error: error.message
    });
  }
});

// Create new car (Admin only)
router.post('/', authenticateToken, authorizeAdmin, upload.single('image'), async (req, res) => {
  try {
    // Validate request body
    const { error, value } = carSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const carData = {
      ...value,
      imageUrl: req.file ? `/uploads/cars/${req.file.filename}` : null,
      features: value.features || []
    };

    const car = await Car.create(carData);

    res.status(201).json({
      message: 'Car created successfully',
      car
    });
  } catch (error) {
    console.error('Create car error:', error);
    res.status(500).json({
      message: 'Failed to create car',
      error: error.message
    });
  }
});

// Update car (Admin only)
router.put('/:id', authenticateToken, authorizeAdmin, upload.single('image'), async (req, res) => {
  try {
    const carId = parseInt(req.params.id);
    
    if (isNaN(carId)) {
      return res.status(400).json({
        message: 'Invalid car ID'
      });
    }

    // Check if car exists
    const existingCar = await Car.findById(carId);
    if (!existingCar) {
      return res.status(404).json({
        message: 'Car not found'
      });
    }

    // Validate request body (allow partial updates)
    const updateSchema = carSchema.fork(
      ['brand', 'model', 'year', 'transmission', 'fuelType', 'seats', 'pricePerDay', 'licensePlate'],
      (schema) => schema.optional()
    );

    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const updateData = { ...value };

    // Handle image upload
    if (req.file) {
      updateData.imageUrl = `/uploads/cars/${req.file.filename}`;
      
      // Delete old image if exists
      if (existingCar.image_url && existingCar.image_url.startsWith('/uploads/')) {
        const oldImagePath = path.join(__dirname, '..', existingCar.image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updatedCar = await Car.update(carId, updateData);

    // Parse features JSON
    updatedCar.features = updatedCar.features ? JSON.parse(updatedCar.features) : [];

    res.json({
      message: 'Car updated successfully',
      car: updatedCar
    });
  } catch (error) {
    console.error('Update car error:', error);
    res.status(500).json({
      message: 'Failed to update car',
      error: error.message
    });
  }
});

// Delete car (Admin only)
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const carId = parseInt(req.params.id);
    
    if (isNaN(carId)) {
      return res.status(400).json({
        message: 'Invalid car ID'
      });
    }

    // Get car details before deletion to remove image
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({
        message: 'Car not found'
      });
    }

    await Car.delete(carId);

    // Delete associated image
    if (car.image_url && car.image_url.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', car.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({
      message: 'Car deleted successfully'
    });
  } catch (error) {
    console.error('Delete car error:', error);
    res.status(500).json({
      message: 'Failed to delete car',
      error: error.message
    });
  }
});

// Check car availability
router.post('/:id/check-availability', async (req, res) => {
  try {
    const carId = parseInt(req.params.id);
    
    if (isNaN(carId)) {
      return res.status(400).json({
        message: 'Invalid car ID'
      });
    }

    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({
        message: 'End date must be after start date'
      });
    }

    if (start < new Date()) {
      return res.status(400).json({
        message: 'Start date cannot be in the past'
      });
    }

    const isAvailable = await Car.checkAvailability(carId, startDate, endDate);

    res.json({
      available: isAvailable,
      message: isAvailable ? 'Car is available for the selected dates' : 'Car is not available for the selected dates'
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      message: 'Failed to check availability',
      error: error.message
    });
  }
});

module.exports = router;