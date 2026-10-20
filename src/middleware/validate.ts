import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import { AppError } from '../utils/app-error.js';

interface ValidationSchema {
  body?: ZodObject;
  query?: ZodObject;
  params?: ZodObject;
}

export const validate = (schema: ValidationSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        // In Express 5 req.query is a getter, so it can't be assigned directly
        Object.defineProperty(req, 'query', {
          value: await schema.query.parseAsync(req.query),
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
      if (schema.params) {
        req.params = (await schema.params.parseAsync(req.params)) as Request['params'];
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format clean field-level error messages
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          status: 'fail',
          statusCode: 400,
          message: 'Validation failed',
          errors: formattedErrors,
        });
        return;
      }
      next(error);
    }
  };
};
