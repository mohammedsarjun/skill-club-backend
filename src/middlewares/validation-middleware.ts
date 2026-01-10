import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';

export const validate =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction): void | Response => {
    try {
      next();
      req.body = schema.parse(req.body);
    } catch (err) {
      if (err instanceof ZodError) {
        console.log(err);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: err.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(err);
    }
  };
