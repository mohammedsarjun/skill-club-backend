import { Document, Types } from 'mongoose';

export interface IDispute extends Document {
  _id: Types.ObjectId;
  contractId: Types.ObjectId;
  raisedBy: 'client' | 'freelancer' | 'system';
  scope: 'contract' | 'milestone' | 'worklog';
  scopeId: Types.ObjectId | null;
  contractType: 'hourly' | 'fixed' | 'fixed_with_milestones';
  reasonCode: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'rejected';
  resolution?: {
    outcome: 'refund_client' | 'pay_freelancer' | 'split';
    clientAmount: number;
    freelancerAmount: number;
    decidedBy: 'admin' | 'system';
    decidedAt?: Date;
  };
  disputeId: string;
  createdAt: Date;
  updatedAt: Date;
}
