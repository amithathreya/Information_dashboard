import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  // Log error details with context
  logger.error(`Error: ${err.message} | Path: ${req.path} | Method: ${req.method}`);
  logger.error(err.stack);

  // Don't leak error details in production
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message;

  res.status(statusCode).json({ 
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};