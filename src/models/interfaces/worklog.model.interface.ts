import { Document, Types } from 'mongoose';

export interface IWorklog extends Document {
  worklogId: string;
  contractId: Types.ObjectId;
  milestoneId?: Types.ObjectId;
  freelancerId: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  duration: number;
  files: { fileName: string; fileUrl: string }[];
  description?: string;
  status: 'submitted' | 'approved' | 'rejected' | 'paid';
  reviewedAt?: Date;
  reviewMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
