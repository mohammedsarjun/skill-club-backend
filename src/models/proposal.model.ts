import mongoose, { Model, Schema } from 'mongoose';
import { IProposal } from './interfaces/proposal.model.interface';

const proposalSchema = new Schema<IProposal>(
  {
    freelancerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },

    hourlyRate: { type: Number },
    availableHoursPerWeek: { type: Number },

    proposedBudget: { type: Number },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ['pending_verification', 'rejected', 'offer_sent'],
      default: 'pending_verification',
    },
    coverLetter: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

proposalSchema.index({ freelancerId: 1, jobId: 1 }, { unique: true });

export const proposalModel: Model<IProposal> = mongoose.model<IProposal>(
  'proposal',
  proposalSchema,
);
