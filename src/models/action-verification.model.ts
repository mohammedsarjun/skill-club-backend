import { model, Schema } from 'mongoose';
import { IUserActionVerification } from './interfaces/action-verification.model.interface';

const userActionVerificationSchema = new Schema<IUserActionVerification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  actionType: {
    type: String,
    enum: ['emailChange', 'passwordReset', 'phoneUpdate', 'twoFASetup'],
    required: true,
  },
  actionData: { type: Schema.Types.Mixed, required: true },
  passwordVerified: { type: Boolean, default: false },
  otpSent: { type: Boolean, default: false },
  otpVerified: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'completed', 'expired', 'failed'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now, index: { expires: 3600 } },
  updatedAt: { type: Date, default: Date.now },
});

export const UserActionVerificationModel = model<IUserActionVerification>(
  'UserActionVerification',
  userActionVerificationSchema,
);
