import { Document, Types } from 'mongoose';

export type ContractTransactionPurpose =
  | 'funding'
  | 'release'
  | 'commission'
  | 'refund'
  | 'hold'
  | 'withdrawal';

export interface IContractTransaction extends Document {
  transactionId: string;
  contractId: Types.ObjectId;
  paymentId?: Types.ObjectId;
  milestoneId?: Types.ObjectId;
  workLogId?: Types.ObjectId;

  clientId: Types.ObjectId;
  freelancerId: Types.ObjectId;
  role: 'client' | 'freelancer' | null;
  amount: number;
  purpose: ContractTransactionPurpose;
  status:
    | 'active_hold'
    | 'frozen_dispute'
    | 'released_to_freelancer'
    | 'refunded_back_to_client'
    | 'released_back_to_contract'
    | 'amount_split_between_parties'
    | 'withdrawal_requested'
    | 'withdrawal_approved'
    | 'completed';
  description: string;

  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}
