export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred.';
  let details = err.details || [];

  // Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_IDENTIFIER';
    message = `Invalid format for resource ID: ${err.value}`;
  }

  // MongoDB Duplicate Key (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_RESOURCE';
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'resource';
    const val = err.keyValue ? err.keyValue[field] : '';
    message = `A resource with ${field} '${val}' already exists.`;
  }

  // Zod Validation Error
  if (err.name === 'ZodError' || (err.errors && Array.isArray(err.errors))) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = err.errors?.[0]?.message || 'Request payload validation failed.';
    details = (err.errors || []).map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = Object.values(err.errors).map((val) => val.message).join(', ');
    details = Object.keys(err.errors).map((key) => ({
      field: key,
      message: err.errors[key].message,
    }));
  }

  if (!err.isOperational && statusCode === 500) {
    console.error('[UNHANDLED ERROR]', err);
  }

  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message,
      details,
    },
  });
};
