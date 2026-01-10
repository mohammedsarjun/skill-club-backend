import mongoose, { Schema } from 'mongoose';
import { IContractTransaction } from './interfaces/contract-transaction.model.interface';

const ContractTransactionSchema = new Schema<IContractTransaction>(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    contractId: { type: Schema.Types.ObjectId, required: true, ref: 'Contract', index: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    milestoneId: { type: Schema.Types.ObjectId },

    clientId: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    freelancerId: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },

    amount: { type: Number, required: true },
    purpose: {
      type: String,
      enum: ['funding', 'release', 'commission', 'refund'],
      required: true,
    },
    description: { type: String, required: true },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true },
);

ContractTransactionSchema.pre<IContractTransaction>('validate', async function (next) {
  if (this.transactionId && String(this.transactionId).trim().length > 0) return next();

  const prefix = '#CTX';
  const gen = () => `${prefix}${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

  this.transactionId = gen();
  return next();
});

export const ContractTransaction = mongoose.model<IContractTransaction>(
  'ContractTransaction',
  ContractTransactionSchema,
);
