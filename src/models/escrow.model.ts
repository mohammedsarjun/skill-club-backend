import mongoose, { Schema } from 'mongoose';
import { IEscrow } from './interfaces/escrow.model.interface';

const EscrowSchema = new Schema<IEscrow>(
  {
    escrowId: { type: String, required: true, unique: true, index: true },
    contractId: { type: Schema.Types.ObjectId, required: true, ref: 'Contract', index: true },
    paymentId: { type: Schema.Types.ObjectId, required: true, ref: 'Payment' },

    clientId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    freelancerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },

    amount: { type: Number, required: true },

    status: { type: String, enum: ['held', 'released', 'refunded'], default: 'held' },
    heldAt: { type: Date, default: Date.now },
    releasedAt: Date,
    refundedAt: Date,

    milestoneId: Schema.Types.ObjectId,
    description: { type: String, required: true },
    purpose: { type: String, required: true },
  },
  { timestamps: true },
);

EscrowSchema.pre<IEscrow>('validate', async function (next) {
  if (this.escrowId && String(this.escrowId).trim().length > 0) return next();

  const prefix = '#ESC';
  const gen = () => `${prefix}${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

  this.escrowId = gen();
  return next();
});

export const Escrow = mongoose.model<IEscrow>('Escrow', EscrowSchema);
