import mongoose, { Schema } from 'mongoose';
import { IDispute } from './interfaces/dispute.model.interface';

const DisputeResolutionSchema = new Schema({
  outcome: {
    type: String,
    enum: ['refund_client', 'pay_freelancer', 'split'],
    required: true,
  },
  clientAmount: { type: Number, required: true },
  freelancerAmount: { type: Number, required: true },
  decidedBy: {
    type: String,
    enum: ['admin', 'system'],
    required: true,
  },
  decidedAt: { type: Date, default: Date.now },
});

const DisputeSchema = new Schema<IDispute>(
  {
    disputeId: { type: String, required: true, unique: true, index: true },
    contractId: { type: Schema.Types.ObjectId, required: true, ref: 'Contract', index: true },
    raisedBy: {
      type: String,
      enum: ['client', 'freelancer', 'system'],
      required: true,
    },
    scope: {
      type: String,
      enum: ['contract', 'milestone', 'worklog'],
      required: true,
    },
    scopeId: { type: Schema.Types.ObjectId, default: null },
    contractType: {
      type: String,
      enum: ['hourly', 'fixed', 'fixed_with_milestones'],
      required: true,
    },
    reasonCode: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'rejected'],
      default: 'open',
      index: true,
    },
    resolution: DisputeResolutionSchema,
  },
  { timestamps: true },
);

DisputeSchema.index({ contractId: 1, status: 1 });
DisputeSchema.index({ createdAt: -1 });

const CounterSchema = new Schema({ _id: String, seq: { type: Number, default: 0 } });
const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

DisputeSchema.pre<IDispute>('save', async function (next) {
  if (!this.isNew) return next();
  try {
    const counter = await Counter.findOneAndUpdate(
      { _id: 'disputeId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    ).exec();
    const seq = (counter && (counter as any).seq) || 1;
    this.disputeId = `dspt-${String(seq).padStart(3, '0')}`;
    next();
  } catch (err) {
    next(err as any);
  }
});

export const Dispute = mongoose.model<IDispute>('Dispute', DisputeSchema);
