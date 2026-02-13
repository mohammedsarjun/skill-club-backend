import mongoose, { Schema } from 'mongoose';
import { IWorklog } from './interfaces/worklog.model.interface';

const WorklogSchema = new Schema<IWorklog>(
  {
    worklogId: {
      type: String,
      required: true,
      unique: true,
    },
    contractId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Contract',
    },
    milestoneId: {
      type: Schema.Types.ObjectId,
      ref: 'Milestone',
    },
    freelancerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    disputeWindowEndDate: {
      type: Date,
    },
    files: [
      {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
      },
    ],
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['submitted', 'approved', 'rejected', 'paid'],
      default: 'submitted',
    },
    reviewedAt: {
      type: Date,
    },
    reviewMessage: {
      type: String,
    },
  },
  { timestamps: true },
);

WorklogSchema.index({ contractId: 1, freelancerId: 1 });
WorklogSchema.index({ milestoneId: 1 });

export const WorklogModel = mongoose.model<IWorklog>('Worklog', WorklogSchema);
