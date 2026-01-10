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

export const Dispute = mongoose.model<IDispute>('Dispute', DisputeSchema);
