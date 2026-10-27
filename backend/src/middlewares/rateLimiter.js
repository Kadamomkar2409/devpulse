import { AppError } from '../utils/AppError.js';

/**
 * Lightweight in-memory rate limiting middleware
 * Enforces request quota per IP window without external Redis dependency
 */
export const rateLimiter = ({ windowMs = 15 * 60 * 1000, max = 200 } = {}) => {
  const requests = new Map();

  // Periodically purge expired IP tracking entries
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of requests.entries()) {
      if (now - data.startTime > windowMs) {
        requests.delete(ip);
      }
    }
  }, windowMs);

  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }

  return (req, res, next) => {
    // Skip rate limiting in test environment
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const ip =
      req.ip ||
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';

    const now = Date.now();
    const record = requests.get(ip);

    if (!record || now - record.startTime > windowMs) {
      requests.set(ip, { count: 1, startTime: now });
      return next();
    }

    record.count += 1;
    if (record.count > max) {
      return next(
        new AppError(
          'Too many requests from this IP, please try again after 15 minutes.',
          429,
          'RATE_LIMIT_EXCEEDED'
        )
      );
    }

    next();
  };
};
