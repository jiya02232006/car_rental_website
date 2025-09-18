const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { registerValidation, loginValidation } = require('../validators/authValidators');
const { generateToken, hashPassword } = require('../utils/authUtils');
const { sendResponse, sendError } = require('../utils/responseUtils');

const authController = {
  // Register new user
  async register(req, res) {
    try {
      // Validate input
      const { error } = registerValidation(req.body);
      if (error) {
        return sendError(res, 400, error.details[0].message);
      }

      const { email, password, firstName, lastName, phone } = req.body;

      // Check if user already exists
      const existingUser = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUser.length > 0) {
        return sendError(res, 409, 'User already exists with this email');
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const result = await db.query(
        'INSERT INTO users (email, password, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)',
        [email, hashedPassword, firstName, lastName, phone]
      );

      // Generate token
      const token = generateToken({ id: result.insertId, email, role: 'customer' });

      // Get user data without password
      const userData = {
        id: result.insertId,
        email,
        firstName,
        lastName,
        phone,
        role: 'customer'
      };

      sendResponse(res, 201, 'User registered successfully', { user: userData, token });
    } catch (error) {
      console.error('Registration error:', error);
      sendError(res, 500, 'Internal server error');
    }
  },

  // Login user
  async login(req, res) {
    try {
      // Validate input
      const { error } = loginValidation(req.body);
      if (error) {
        return sendError(res, 400, error.details[0].message);
      }

      const { email, password } = req.body;

      // Find user
      const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length === 0) {
        return sendError(res, 401, 'Invalid credentials');
      }

      const user = users[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return sendError(res, 401, 'Invalid credentials');
      }

      // Generate token
      const token = generateToken({ id: user.id, email: user.email, role: user.role });

      // User data without password
      const userData = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role
      };

      sendResponse(res, 200, 'Login successful', { user: userData, token });
    } catch (error) {
      console.error('Login error:', error);
      sendError(res, 500, 'Internal server error');
    }
  },

  // Get current user profile
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const users = await db.query(
        'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return sendError(res, 404, 'User not found');
      }

      const user = users[0];
      const userData = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at
      };

      sendResponse(res, 200, 'Profile retrieved successfully', { user: userData });
    } catch (error) {
      console.error('Get profile error:', error);
      sendError(res, 500, 'Internal server error');
    }
  },

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!currentPassword || !newPassword) {
        return sendError(res, 400, 'Current password and new password are required');
      }

      if (newPassword.length < 6) {
        return sendError(res, 400, 'New password must be at least 6 characters long');
      }

      // Get current user
      const users = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
      if (users.length === 0) {
        return sendError(res, 404, 'User not found');
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
      if (!isValidPassword) {
        return sendError(res, 401, 'Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);

      // Update password
      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId]);

      sendResponse(res, 200, 'Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);
      sendError(res, 500, 'Internal server error');
    }
  }
};

module.exports = authController;