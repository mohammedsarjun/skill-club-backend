import { Schema, model } from 'mongoose';
import { IReportedJob } from './interfaces/reported-job.model.interface';

const reportedJobSchema = new Schema<IReportedJob>({
  freelancerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

reportedJobSchema.index({ freelancerId: 1, jobId: 1 }, { unique: true });

const ReportedJob = model<IReportedJob>('ReportedJob', reportedJobSchema);

export default ReportedJob;
