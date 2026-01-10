import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import dotenv from 'dotenv';

dotenv.config();

export class JwtService {
  private secret: string;

  constructor() {
    this.secret = process.env.JWT_SECRET as string;
    if (!this.secret) {
      throw new Error('JWT_SECRET not found in environment variables');
    }
  }

  /** Create a token (access or refresh) */
  createToken(payload: object, expiresIn: number | StringValue): string {
    const options: SignOptions = { expiresIn };
    return jwt.sign(payload, this.secret, options);
  }

  /** Verify a token and return typed payload */
  verifyToken<T extends JwtPayload>(token: string): T {
    return jwt.verify(token, this.secret) as T;
  }

  /** Decode token without verification */
  decodeToken(token: string) {
    return jwt.decode(token);
  }
}

// Optional: export a singleton instance
export const jwtService = new JwtService();
