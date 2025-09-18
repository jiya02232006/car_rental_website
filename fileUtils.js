const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

/**
 * Generate unique filename
 * @param {String} originalName - Original filename
 * @returns {String} Unique filename
 */
const generateUniqueFilename = (originalName) => {
  const extension = path.extname(originalName);
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(16).toString('hex');
  return `${timestamp}-${randomString}${extension}`;
};

/**
 * Validate file type
 * @param {Object} file - Multer file object
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @returns {Boolean} Validation result
 */
const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.mimetype);
};

/**
 * Validate file size
 * @param {Object} file - Multer file object
 * @param {Number} maxSize - Maximum file size in bytes
 * @returns {Boolean} Validation result
 */
const validateFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

/**
 * Handle file upload with validation
 * @param {Object} file - Multer file object
 * @returns {String} File URL or path
 */
const handleFileUpload = async (file) => {
  try {
    // Define allowed image types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB default

    // Validate file type
    if (!validateFileType(file, allowedTypes)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    }

    // Validate file size
    if (!validateFileSize(file, maxSize)) {
      throw new Error(`File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`);
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.originalname);
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const filePath = path.join(uploadPath, filename);

    // Ensure upload directory exists
    await ensureDirectoryExists(uploadPath);

    // Move file to upload directory
    await fs.writeFile(filePath, file.buffer);

    // Return the file URL/path
    return `/uploads/${filename}`;
  } catch (error) {
    throw new Error(`File upload failed: ${error.message}`);
  }
};

/**
 * Ensure directory exists, create if it doesn't
 * @param {String} dirPath - Directory path
 */
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(dirPath, { recursive: true });
    } else {
      throw error;
    }
  }
};

/**
 * Delete file from filesystem
 * @param {String} filename - Name of file to delete
 */
const deleteFile = async (filename) => {
  try {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const filePath = path.join(uploadPath, filename);
    await fs.unlink(filePath);
  } catch (error) {
    // Ignore file not found errors
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

/**
 * Get file extension from filename
 * @param {String} filename - Filename
 * @returns {String} File extension
 */
const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

/**
 * Generate secure filename from original filename
 * @param {String} originalName - Original filename
 * @returns {String} Sanitized filename
 */
const sanitizeFilename = (originalName) => {
  // Remove special characters and spaces
  const sanitized = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  // Generate unique filename
  return generateUniqueFilename(sanitized);
};

module.exports = {
  generateUniqueFilename,
  validateFileType,
  validateFileSize,
  handleFileUpload,
  ensureDirectoryExists,
  deleteFile,
  getFileExtension,
  sanitizeFilename
};