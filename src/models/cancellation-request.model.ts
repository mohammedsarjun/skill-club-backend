import mongoose, { Schema } from 'mongoose';
import { ICancellationRequest } from './interfaces/cancellation-request.model.interface';

const CancellationRequestSchema = new Schema<ICancellationRequest>(
  {
    cancellationRequestId: { type: String, required: true, unique: true, index: true },
    contractId: { type: Schema.Types.ObjectId, required: true, ref: 'Contract', index: true },
    initiatedBy: { type: String, enum: ['client', 'freelancer'], required: true },
    initiatorId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    reason: { type: String, required: true },
    clientSplitPercentage: { type: Number, required: true, min: 0, max: 100 },
    freelancerSplitPercentage: { type: Number, required: true, min: 0, max: 100 },
    totalHeldAmount: { type: Number, required: true },
    clientAmount: { type: Number, required: true },
    freelancerAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'disputed', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },
    respondedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    respondedAt: Date,
    responseMessage: String,
  },
  { timestamps: true },
);

CancellationRequestSchema.index({ contractId: 1, status: 1 });
CancellationRequestSchema.index({ createdAt: -1 });

const CounterSchema = new Schema({ _id: String, seq: { type: Number, default: 0 } });
const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

CancellationRequestSchema.pre<ICancellationRequest>('validate', async function (next) {
  if (!this.isNew) return next();
  try {
    const counter = await Counter.findOneAndUpdate(
      { _id: 'cancellationRequestId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    ).exec();
    const seq = (counter && (counter as unknown as { seq: number }).seq) || 1;
    this.cancellationRequestId = `cncl-${String(seq).padStart(4, '0')}`;
    next();
  } catch (err) {
    next(err as Error);
  }
});

export const CancellationRequest = mongoose.model<ICancellationRequest>(
  'CancellationRequest',
  CancellationRequestSchema,
);
