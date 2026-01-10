import { Document, Types } from 'mongoose';

export interface IFreelancerWallet extends Document {
  freelancerId: Types.ObjectId;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  totalCommissionPaid: number;
  
  createdAt?: Date;
  updatedAt?: Date;
}
