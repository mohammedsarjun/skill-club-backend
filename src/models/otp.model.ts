import mongoose, { Model, Schema } from 'mongoose';
import { IOtp } from './interfaces/otp.model.interface';
const otpExpiry=Number(process.env.OTP_EXPIRY)
const otpSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  purpose: {
    type: String,
    enum: ['signup', 'forgotPassword', 'changeEmail'], // extend later
    required: true,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + otpExpiry * 1000),
    index: { expires: `${otpExpiry}s` },
  },
});

export const otpModel: Model<IOtp> = mongoose.model<IOtp>('otp', otpSchema);
