import { Document, Types } from 'mongoose';

export type ContractTransactionPurpose = 'funding' | 'release' | 'commission' | 'refund'|'hold';

export interface IContractTransaction extends Document {
  transactionId: string;
  contractId: Types.ObjectId;
  paymentId?: Types.ObjectId;
  milestoneId?: Types.ObjectId;
  
  clientId: Types.ObjectId;
  freelancerId: Types.ObjectId;
  
  amount: number;
  purpose: ContractTransactionPurpose;
  description: string;
  
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}
