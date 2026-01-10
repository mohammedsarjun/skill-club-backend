// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express'; // ⬅️ Import NextFunction
import AppError from '../utils/app-error';
import { appLogger } from '../utils/logger';
import { HttpStatus } from '../enums/http-status.enum';

// ⚠️ CRITICAL CHANGE: Add the fourth argument 'next' ⚠️
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction, // <---- ADD THIS!
): void | Response => {
  appLogger.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });
  console.log(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // For unexpected errors
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Something went wrong on the server.',
    error: err.message,
  });
};
