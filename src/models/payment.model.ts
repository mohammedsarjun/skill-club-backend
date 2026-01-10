import mongoose, { Schema } from 'mongoose';
import { IPayment } from './interfaces/payment.model.interface';

const PaymentSchema = new Schema<IPayment>(
  {
    paymentId: { type: String, required: true, unique: true, index: true },
    contractId: { type: Schema.Types.ObjectId, required: true, ref: 'Contract', index: true },
    clientId: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    freelancerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    isMilestonePayment: { type: Boolean, required: true, default: false },
    milestoneId: { type: Schema.Types.ObjectId, ref: 'Milestone' },
    purpose: {
      type: String,
      enum: ['contract_funding', 'milestone_funding', 'hourly_advance'],
      required: true,
    },
    amount: { type: Number, required: true },

    gateway: { type: String, enum: ['payu', 'razorpay', 'stripe'], required: true },
    gatewayTransactionId: String,
    gatewayOrderId: String,
    gatewayResponse: Schema.Types.Mixed,

    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'cancelled'],
      default: 'pending',
    },
    paidAt: Date,
    failedReason: String,
  },
  { timestamps: true },
);

PaymentSchema.pre<IPayment>('validate', async function (next) {
  if (this.paymentId && String(this.paymentId).trim().length > 0) return next();

  const prefix = '#PAY';
  const gen = () => `${prefix}${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

  this.paymentId = gen();
  return next();
});

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
