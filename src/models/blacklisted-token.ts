import mongoose, { Model } from 'mongoose';
import { IBlacklistedToken } from './interfaces/blacklisted-token.interface';

const blacklistedTokenSchema = new mongoose.Schema<IBlacklistedToken>({
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// Index for faster lookup
blacklistedTokenSchema.index({ token: 1 });

// TTL index for auto deletion
blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const BlacklistedToken: Model<IBlacklistedToken> = mongoose.model<IBlacklistedToken>(
  'BlacklistedToken',
  blacklistedTokenSchema,
);

export default BlacklistedToken;
