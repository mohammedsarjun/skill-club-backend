import { Types } from 'mongoose';

export interface CreateActionVerificationDto {
  userId: Types.ObjectId;
  actionType: 'emailChange' | 'passwordReset' | 'phoneUpdate';
  actionData: Record<string, unknown>;
}

export interface RequestChangeEmailDto {
  userId: Types.ObjectId;
  actionType: 'emailChange' | 'passwordReset' | 'phoneUpdate';
  actionData: Record<string, unknown>;
  status: 'pending';
  passwordVerified: boolean;
  otpSent: boolean;
}
