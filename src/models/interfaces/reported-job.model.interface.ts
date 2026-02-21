import mongoose, { Document, Types } from 'mongoose';

export interface IReportedJob extends Document {
  freelancerId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  reason: string;
  createdAt: Date;
}

export interface IHighReportedJob {
  jobId: Types.ObjectId;
  totalReportCount: number;
}
