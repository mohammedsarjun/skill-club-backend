import { Document, Types } from 'mongoose';

export type ContractTransactionPurpose = 'funding' | 'release' | 'commission' | 'refund' | 'hold';

export interface IContractTransaction extends Document {
  transactionId: string;
  contractId: Types.ObjectId;
  paymentId?: Types.ObjectId;
  milestoneId?: Types.ObjectId;
  workLogId?: Types.ObjectId;

  clientId: Types.ObjectId;
  freelancerId: Types.ObjectId;

  amount: number;
  purpose: ContractTransactionPurpose;
  status:
    | 'active_hold'
    | 'frozen_dispute'
    | 'released_to_freelancer'
    | 'refunded_back_to_client'
    | 'released_back_to_contract'
    | 'completed';
  description: string;

  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}
