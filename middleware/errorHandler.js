const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message
  });
};

module.exports = errorHandler;