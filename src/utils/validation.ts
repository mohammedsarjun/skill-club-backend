import { ZodError, ZodType } from 'zod';
import AppError from './app-error';
import { ERROR_MESSAGES } from '../contants/error-constants';
import { HttpStatus } from '../enums/http-status.enum';

export const validateData = <T>(schema: ZodType<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (err) {
    if (err instanceof ZodError) {
      // Log all issues to make debugging easier in dev
      console.error('Validation issues:', err.issues);
      // include issues in the error message to return a clearer error in dev
      const details = JSON.stringify(
        err.issues.map((i) => ({ path: i.path, message: i.message, code: i.code })),
      );
      throw new AppError(
        `${ERROR_MESSAGES.VALIDATION.FAILED} - ${details}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Rethrow other types of errors
    throw err;
  }
};
