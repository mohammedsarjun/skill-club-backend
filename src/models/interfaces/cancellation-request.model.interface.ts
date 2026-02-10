import { Document, Types } from 'mongoose';

export interface ICancellationRequest extends Document {
  _id: Types.ObjectId;
  cancellationRequestId: string;
  contractId: Types.ObjectId;
  initiatedBy: 'client' | 'freelancer';
  initiatorId: Types.ObjectId;
  reason: string;
  clientSplitPercentage: number;
  freelancerSplitPercentage: number;
  totalHeldAmount: number;
  clientAmount: number;
  freelancerAmount: number;
  status: 'pending' | 'accepted' | 'disputed' | 'rejected' | 'cancelled';
  respondedBy?: Types.ObjectId;
  respondedAt?: Date;
  responseMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
