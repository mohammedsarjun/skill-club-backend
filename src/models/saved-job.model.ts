import { Schema, model } from 'mongoose';
import { ISavedJob } from './interfaces/saved-job.model.interface';

const savedJobSchema = new Schema<ISavedJob>({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 3. Prevent duplicate saved jobs
savedJobSchema.index({ freelancerId: 1, jobId: 1 }, { unique: true });

// 4. Create model
const SavedJob = model<ISavedJob>('SavedJob', savedJobSchema);

export default SavedJob;
