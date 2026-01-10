import mongoose, { Schema } from 'mongoose';
import { ITransaction } from './interfaces/transaction.model.interface';

const TransactionSchema = new Schema<ITransaction>(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', index: true },
    contractId: { type: Schema.Types.ObjectId, required: true, ref: 'Contract', index: true },

    fromUserId: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    toUserId: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },

    type: { type: String, enum: ['debit', 'credit'], required: true },
    purpose: {
      type: String,
      enum: [
        'contract_funding',
        'milestone_funding',
        'hourly_payment',
        'refund',
        'withdrawal',
        'hourly_advance',
      ],
      required: true,
    },
    amount: { type: Number, required: true },
    milestoneId: { type: Schema.Types.ObjectId, ref: 'Milestone' },
    description: { type: String, required: true },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true },
);

TransactionSchema.pre<ITransaction>('validate', async function (next) {
  if (this.transactionId && String(this.transactionId).trim().length > 0) return next();

  const prefix = '#TXN';
  const gen = () => `${prefix}${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

  this.transactionId = gen();
  return next();
});

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
