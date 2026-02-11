import mongoose, { Document } from 'mongoose';

export interface IReportedJob extends Document {
  freelancerId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  reason: string;
  createdAt: Date;
}
