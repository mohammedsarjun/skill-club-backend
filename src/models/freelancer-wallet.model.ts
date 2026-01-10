import mongoose, { Schema } from 'mongoose';
import { IFreelancerWallet } from './interfaces/freelancer-wallet.model.interface';

const FreelancerWalletSchema = new Schema<IFreelancerWallet>(
  {
    freelancerId: { type: Schema.Types.ObjectId, required: true, unique: true, ref: 'User', index: true },
    balance: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
    totalCommissionPaid: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const FreelancerWallet = mongoose.model<IFreelancerWallet>(
  'FreelancerWallet',
  FreelancerWalletSchema,
);
