import { Document, Types } from 'mongoose';

export interface IBankDetails extends Document {
  userId: Types.ObjectId;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: 'savings' | 'current';
  verified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
