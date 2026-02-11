import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../utils/jwt';
import { HttpStatus } from '../enums/http-status.enum';
import { ERROR_MESSAGES } from '../contants/error-constants';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
      activeRole?: string;
      roles?: string[];
    };
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void | Response {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ code: 'TOKEN_EXPIRED', message: 'Unauthorized: No token provided' });
    }

    const decoded = jwtService.verifyToken<{
      userId: string;
      activeRole?: string;
      roles?: string[];
    }>(token);

    req.user = { userId: decoded.userId, activeRole: decoded.activeRole, roles: decoded.roles };
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ message: 'Forbidden: Invalid or expired token' });
  }
}

export function roleGuard(requiredRole: string) {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    if (req.user?.activeRole === requiredRole) {
      return next();
    }
    if (req.user?.roles && req.user.roles.includes(requiredRole)) {
      return next();
    }
    return res.status(HttpStatus.FORBIDDEN).json({ message: ERROR_MESSAGES.AUTH.UNAUTHORIZED });
  };
}
