/**
 * Utility functions for standardized API responses
 */

const sendResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
    ...(data && { data })
  };
  
  return res.status(statusCode).json(response);
};

const sendError = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors && { errors })
  };
  
  return res.status(statusCode).json(response);
};

const sendPaginatedResponse = (res, statusCode, message, items, pagination) => {
  const response = {
    success: true,
    message,
    data: items,
    pagination
  };
  
  return res.status(statusCode).json(response);
};

module.exports = {
  sendResponse,
  sendError,
  sendPaginatedResponse
};