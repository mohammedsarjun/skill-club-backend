import { Document, Types } from 'mongoose';

export interface IWorklog extends Document {
  _id: Types.ObjectId;
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
  disputeWindowEndDate?: Date;
  reviewMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
