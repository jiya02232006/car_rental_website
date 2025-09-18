const Joi = require('joi');

// Car creation validation schema
const carValidation = (data) => {
  const schema = Joi.object({
    brand: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Brand must be at least 2 characters long',
        'string.max': 'Brand cannot exceed 50 characters',
        'any.required': 'Brand is required'
      }),
    
    model: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Model must be at least 2 characters long',
        'string.max': 'Model cannot exceed 50 characters',
        'any.required': 'Model is required'
      }),
    
    year: Joi.number()
      .integer()
      .min(1990)
      .max(new Date().getFullYear() + 1)
      .required()
      .messages({
        'number.min': 'Year must be 1990 or later',
        'number.max': `Year cannot be later than ${new Date().getFullYear() + 1}`,
        'any.required': 'Year is required'
      }),
    
    transmission: Joi.string()
      .valid('manual', 'automatic', 'cvt')
      .required()
      .messages({
        'any.only': 'Transmission must be manual, automatic, or cvt',
        'any.required': 'Transmission is required'
      }),
    
    fuelType: Joi.string()
      .valid('petrol', 'diesel', 'electric', 'hybrid')
      .required()
      .messages({
        'any.only': 'Fuel type must be petrol, diesel, electric, or hybrid',
        'any.required': 'Fuel type is required'
      }),
    
    seats: Joi.number()
      .integer()
      .min(2)
      .max(9)
      .required()
      .messages({
        'number.min': 'Seats must be at least 2',
        'number.max': 'Seats cannot exceed 9',
        'any.required': 'Number of seats is required'
      }),
    
    pricePerDay: Joi.number()
      .positive()
      .precision(2)
      .required()
      .messages({
        'number.positive': 'Price per day must be a positive number',
        'any.required': 'Price per day is required'
      }),
    
    description: Joi.string()
      .max(1000)
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 1000 characters'
      }),
    
    features: Joi.array()
      .items(Joi.string().max(100))
      .max(20)
      .messages({
        'array.max': 'Cannot have more than 20 features',
        'string.max': 'Each feature cannot exceed 100 characters'
      }),
    
    licensePlate: Joi.string()
      .min(3)
      .max(20)
      .required()
      .pattern(/^[A-Z0-9\-\s]+$/)
      .messages({
        'string.min': 'License plate must be at least 3 characters long',
        'string.max': 'License plate cannot exceed 20 characters',
        'string.pattern.base': 'License plate can only contain uppercase letters, numbers, hyphens, and spaces',
        'any.required': 'License plate is required'
      }),
    
    status: Joi.string()
      .valid('active', 'inactive', 'maintenance')
      .default('active')
      .messages({
        'any.only': 'Status must be active, inactive, or maintenance'
      })
  });

  return schema.validate(data);
};

// Car update validation schema (all fields optional)
const updateCarValidation = (data) => {
  const schema = Joi.object({
    brand: Joi.string()
      .min(2)
      .max(50)
      .messages({
        'string.min': 'Brand must be at least 2 characters long',
        'string.max': 'Brand cannot exceed 50 characters'
      }),
    
    model: Joi.string()
      .min(2)
      .max(50)
      .messages({
        'string.min': 'Model must be at least 2 characters long',
        'string.max': 'Model cannot exceed 50 characters'
      }),
    
    year: Joi.number()
      .integer()
      .min(1990)
      .max(new Date().getFullYear() + 1)
      .messages({
        'number.min': 'Year must be 1990 or later',
        'number.max': `Year cannot be later than ${new Date().getFullYear() + 1}`
      }),
    
    transmission: Joi.string()
      .valid('manual', 'automatic', 'cvt')
      .messages({
        'any.only': 'Transmission must be manual, automatic, or cvt'
      }),
    
    fuelType: Joi.string()
      .valid('petrol', 'diesel', 'electric', 'hybrid')
      .messages({
        'any.only': 'Fuel type must be petrol, diesel, electric, or hybrid'
      }),
    
    seats: Joi.number()
      .integer()
      .min(2)
      .max(9)
      .messages({
        'number.min': 'Seats must be at least 2',
        'number.max': 'Seats cannot exceed 9'
      }),
    
    pricePerDay: Joi.number()
      .positive()
      .precision(2)
      .messages({
        'number.positive': 'Price per day must be a positive number'
      }),
    
    description: Joi.string()
      .max(1000)
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 1000 characters'
      }),
    
    features: Joi.array()
      .items(Joi.string().max(100))
      .max(20)
      .messages({
        'array.max': 'Cannot have more than 20 features',
        'string.max': 'Each feature cannot exceed 100 characters'
      }),
    
    licensePlate: Joi.string()
      .min(3)
      .max(20)
      .pattern(/^[A-Z0-9\-\s]+$/)
      .messages({
        'string.min': 'License plate must be at least 3 characters long',
        'string.max': 'License plate cannot exceed 20 characters',
        'string.pattern.base': 'License plate can only contain uppercase letters, numbers, hyphens, and spaces'
      }),
    
    status: Joi.string()
      .valid('active', 'inactive', 'maintenance')
      .messages({
        'any.only': 'Status must be active, inactive, or maintenance'
      })
  });

  return schema.validate(data);
};

// Car search/filter validation schema
const carSearchValidation = (data) => {
  const schema = Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10),
    
    brand: Joi.string()
      .max(50),
    
    transmission: Joi.string()
      .valid('manual', 'automatic', 'cvt'),
    
    fuelType: Joi.string()
      .valid('petrol', 'diesel', 'electric', 'hybrid'),
    
    minPrice: Joi.number()
      .positive()
      .precision(2),
    
    maxPrice: Joi.number()
      .positive()
      .precision(2),
    
    seats: Joi.number()
      .integer()
      .min(2)
      .max(9),
    
    search: Joi.string()
      .max(100),
    
    status: Joi.string()
      .valid('active', 'inactive', 'maintenance')
      .default('active'),
    
    sortBy: Joi.string()
      .valid('price', 'year', 'brand', 'model', 'created_at')
      .default('created_at'),
    
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
  });

  return schema.validate(data);
};

// Car availability check validation schema
const availabilityValidation = (data) => {
  const schema = Joi.object({
    startDate: Joi.date()
      .iso()
      .min('now')
      .required()
      .messages({
        'date.min': 'Start date cannot be in the past',
        'any.required': 'Start date is required'
      }),
    
    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .required()
      .messages({
        'date.min': 'End date must be after start date',
        'any.required': 'End date is required'
      })
  });

  return schema.validate(data);
};

module.exports = {
  carValidation,
  updateCarValidation,
  carSearchValidation,
  availabilityValidation
};