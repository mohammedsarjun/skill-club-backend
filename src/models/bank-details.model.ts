import mongoose, { Schema } from 'mongoose';
import { IBankDetails } from './interfaces/bank-details.model.interface';

const BankDetailsSchema = new Schema<IBankDetails>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true, unique: true },
    accountHolderName: { type: String, required: true },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    accountType: { type: String, enum: ['savings', 'current'], required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const BankDetails = mongoose.model<IBankDetails>('BankDetails', BankDetailsSchema);
