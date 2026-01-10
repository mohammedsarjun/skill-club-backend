import { Document } from 'mongoose';
export interface IOtp extends Document {
  email: string;
  otp: string;
  purpose: 'signup' | 'forgotPassword' | 'changeEmail';
  createdAt: Date;
  expiresAt: Date;
}
