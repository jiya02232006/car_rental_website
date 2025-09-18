const db = require('../config/database');
const { carValidation, updateCarValidation } = require('../validators/carValidators');
const { sendResponse, sendError } = require('../utils/responseUtils');
const { handleFileUpload } = require('../utils/fileUtils');

const carsController = {
  // Get all cars with filters and pagination
  async getAllCars(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        brand,
        transmission,
        fuelType,
        minPrice,
        maxPrice,
        seats,
        search,
        status = 'active'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      let whereConditions = ['c.status = ?'];
      let queryParams = [status];

      // Build dynamic where conditions
      if (brand) {
        whereConditions.push('c.brand = ?');
        queryParams.push(brand);
      }
      
      if (transmission) {
        whereConditions.push('c.transmission = ?');
        queryParams.push(transmission);
      }
      
      if (fuelType) {
        whereConditions.push('c.fuel_type = ?');
        queryParams.push(fuelType);
      }
      
      if (minPrice) {
        whereConditions.push('c.price_per_day >= ?');
        queryParams.push(parseFloat(minPrice));
      }
      
      if (maxPrice) {
        whereConditions.push('c.price_per_day <= ?');
        queryParams.push(parseFloat(maxPrice));
      }
      
      if (seats) {
        whereConditions.push('c.seats = ?');
        queryParams.push(parseInt(seats));
      }
      
      if (search) {
        whereConditions.push('(c.brand LIKE ? OR c.model LIKE ? OR c.description LIKE ?)');
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }

      const whereClause = whereConditions.join(' AND ');

      // Get cars with average rating
      const carsQuery = `
        SELECT 
          c.*,
          COALESCE(AVG(r.rating), 0) as average_rating,
          COUNT(r.id) as review_count
        FROM cars c
        LEFT JOIN reviews r ON c.id = r.car_id
        WHERE ${whereClause}
        GROUP BY c.id
        ORDER BY c.created_at DESC
        LIMIT ? OFFSET ?
      `;

      queryParams.push(parseInt(limit), offset);
      const cars = await db.query(carsQuery, queryParams);

      // Get total count for pagination
      const countQuery = `SELECT COUNT(DISTINCT c.id) as total FROM cars c WHERE ${whereClause}`;
      const countParams = queryParams.slice(0, -2); // Remove limit and offset
      const countResult = await db.query(countQuery, countParams);
      const total = countResult[0].total;

      const totalPages = Math.ceil(total / parseInt(limit));

      sendResponse(res, 200, 'Cars retrieved successfully', {
        cars: cars.map(car => ({
          ...car,
          features: car.features ? JSON.parse(car.features) : [],
          averageRating: parseFloat(car.average_rating).toFixed(1),
          reviewCount: car.review_count
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasMore: page < totalPages
        }
      });
    } catch (error) {
      console.error('Get cars error:', error);
      sendError(res, 500, 'Internal server error');
    }
  },

  // Get single car by ID
  async getCarById(req, res) {
    try {
      const { id } = req.params;

      const carQuery = `
        SELECT 
          c.*,
          COALESCE(AVG(r.rating), 0) as average_rating,
          COUNT(r.id) as review_count
        FROM cars c
        LEFT JOIN reviews r ON c.id = r.car_id
        WHERE c.id = ? AND c.status = 'active'
        GROUP BY c.id
      `;

      const cars = await db.query(carQuery, [id]);

      if (cars.length === 0) {
        return sendError(res, 404, 'Car not found');
      }

      const car = cars[0];

      // Get recent reviews
      const reviewsQuery = `
        SELECT 
          r.rating,
          r.comment,
          r.created_at,
          u.first_name,
          u.last_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.car_id = ?
        ORDER BY r.created_at DESC
        LIMIT 5
      `;

      const reviews = await db.query(reviewsQuery, [id]);

      sendResponse(res, 200, 'Car retrieved successfully', {
        car: {
          ...car,
          features: car.features ? JSON.parse(car.features) : [],
          averageRating: parseFloat(car.average_rating).toFixed(1),
          reviewCount: car.review_count
        },
        reviews
      });
    } catch (error) {
      console.error('Get car error:', error);
      sendError(res, 500, 'Internal server error');
    }
  },

  // Create new car (Admin only)
  async createCar(req, res) {
    try {
      // Validate input
      const { error } = carValidation(req.body);
      if (error) {
        return sendError(res, 400, error.details[0].message);
      }

      const {
        brand,
        model,
        year,
        transmission,
        fuelType,
        seats,
        pricePerDay,
        description,
        features,
        licensePlate
      } = req.body;

      // Handle image upload if present
      let imageUrl = null;
      if (req.file) {
        imageUrl = await handleFileUpload(req.file);
      }

      const result = await db.query(
        `INSERT INTO cars (
          brand, model, year, transmission, fuel_type, 
          seats, price_per_day, description, features, 
          image_url, license_plate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          brand, model, year, transmission, fuelType,
          seats, pricePerDay, description, JSON.stringify(features),
          imageUrl, licensePlate
        ]
      );

      const newCar = await db.query('SELECT * FROM cars WHERE id = ?', [result.insertId]);

      sendResponse(res, 201, 'Car created successfully', {
        car: {
          ...newCar[0],
          features: JSON.parse(newCar[0].features || '[]')
        }
      });
    } catch (error) {
      console.error('Create car error:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return sendError(res, 409, 'A car with this license plate already exists');
      }
      sendError(res, 500, 'Internal server error');
    }
  },

  // Update car (Admin only)
  async updateCar(req, res) {
    try {
      const { id } = req.params;

      // Validate input
      const { error } = updateCarValidation(req.body);
      if (error) {
        return sendError(res, 400, error.details[0].message);
      }

      // Check if car exists
      const existingCar = await db.query('SELECT * FROM cars WHERE id = ?', [id]);
      if (existingCar.length === 0) {
        return sendError(res, 404, 'Car not found');
      }

      const updateData = { ...req.body };

      // Handle image upload if present
      if (req.file) {
        updateData.imageUrl = await handleFileUpload(req.file);
      }

      // Handle features JSON
      if (updateData.features) {
        updateData.features = JSON.stringify(updateData.features);
      }

      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          updateFields.push(`${dbField} = ?`);
          updateValues.push(updateData[key]);
        }
      });

      updateValues.push(id);

      await db.query(
        `UPDATE cars SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        updateValues
      );

      const updatedCar = await db.query('SELECT * FROM cars WHERE id = ?', [id]);

      sendResponse(res, 200, 'Car updated successfully', {
        car: {
          ...updatedCar[0],
          features: JSON.parse(updatedCar[0].features || '[]')
        }
      });
    } catch (error) {
      console.error('Update car error:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return sendError(res, 409, 'A car with this license plate already exists');
      }
      sendError(res, 500, 'Internal server error');
    }
  },

  // Delete car (Admin only)
  async deleteCar(req, res) {
    try {
      const { id } = req.params;

      // Check if car exists
      const existingCar = await db.query('SELECT * FROM cars WHERE id = ?', [id]);
      if (existingCar.length === 0) {
        return sendError(res, 404, 'Car not found');
      }

      // Check if car has active bookings
      const activeBookings = await db.query(
        'SELECT COUNT(*) as count FROM bookings WHERE car_id = ? AND status IN ("pending", "active")',
        [id]
      );

      if (activeBookings[0].count > 0) {
        return sendError(res, 400, 'Cannot delete car with active bookings');
      }

      await db.query('DELETE FROM cars WHERE id = ?', [id]);

      sendResponse(res, 200, 'Car deleted successfully');
    } catch (error) {
      console.error('Delete car error:', error);
      sendError(res, 500, 'Internal server error');
    }
  },

  // Check car availability for specific dates
  async checkAvailability(req, res) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.body;

      if (!startDate || !endDate) {
        return sendError(res, 400, 'Start date and end date are required');
      }

      const conflictingBookings = await db.query(
        `SELECT COUNT(*) as count FROM bookings 
         WHERE car_id = ? AND status IN ('pending', 'active') 
         AND (
           (start_date <= ? AND end_date >= ?) OR
           (start_date <= ? AND end_date >= ?) OR
           (start_date >= ? AND end_date <= ?)
         )`,
        [id, startDate, startDate, endDate, endDate, startDate, endDate]
      );

      const isAvailable = conflictingBookings[0].count === 0;

      sendResponse(res, 200, 'Availability checked successfully', {
        available: isAvailable,
        carId: id,
        startDate,
        endDate
      });
    } catch (error) {
      console.error('Check availability error:', error);
      sendError(res, 500, 'Internal server error');
    }
  }
};

module.exports = carsController;