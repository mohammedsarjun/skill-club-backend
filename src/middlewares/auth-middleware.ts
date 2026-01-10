import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../utils/jwt';
import { HttpStatus } from '../enums/http-status.enum';

// Extend Express Request to include user
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
      roles: string[];
      activeRole: string;
      isClientBlocked: boolean;
      isFreelancerBlocked: boolean;
      clientProfile?: string | undefined;
      freelancerProfile?: string | undefined;
      preferredCurrency?: 'USD' | 'EUR' | 'GBP' | 'INR' | 'AUD' | 'CAD' | 'SGD' | 'JPY';
    };
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void | Response {
  try {
    const token = req.cookies.accessToken; // or get from headers if you prefer
    if (!token) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ code: 'TOKEN_EXPIRED', message: 'Unauthorized: No token provided' });
    }

    // Verify token
    const decoded = jwtService.verifyToken<{
      userId: string;
      roles: string[];
      activeRole: string;
      isClientBlocked: boolean;
      isFreelancerBlocked: boolean;
    }>(token);

    // Attach to request object
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ message: 'Forbidden: Invalid or expired token' });
  }
}

// Optional Role Guard Middleware
export function roleGuard(requiredRole: string) {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    if (!req.user?.roles?.includes(requiredRole)) {
      return res.status(HttpStatus.FORBIDDEN).json({ message: 'Forbidden: Insufficient role' });
    }
    next();
  };
}
