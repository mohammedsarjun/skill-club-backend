import mongoose, { Document } from 'mongoose';

export interface ISavedJob extends Document {
  freelancerId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  createdAt: Date;
}
