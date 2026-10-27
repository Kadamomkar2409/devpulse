import { z } from 'zod';

export const validateRequest = (schema) => (req, res, next) => {
  try {
    if (schema instanceof z.ZodType) {
      req.body = schema.parse(req.body);
    } else {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};
