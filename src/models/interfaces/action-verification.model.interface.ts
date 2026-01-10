import { Document, Types } from 'mongoose';

export interface IUserActionVerification extends Document {
  userId: Types.ObjectId;

  actionType: 'emailChange' | 'passwordReset' | 'phoneUpdate' | 'twoFASetup';

  actionData: Record<string, unknown>; // Can store new email, phone number, or other action-specific data

  passwordVerified: boolean; // optional, only if password is needed
  otpSent: boolean;
  otpVerified: boolean;

  status: 'pending' | 'completed' | 'expired' | 'failed';

  createdAt: Date;
  updatedAt: Date;
}
