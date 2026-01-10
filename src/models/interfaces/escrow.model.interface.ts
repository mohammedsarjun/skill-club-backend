import { Document, Types } from 'mongoose';

export type EscrowStatus = 'held' | 'released' | 'refunded';

export interface IEscrow extends Document {
  escrowId: string;
  contractId: Types.ObjectId;
  paymentId: Types.ObjectId;

  clientId: Types.ObjectId;
  freelancerId: Types.ObjectId;

  amount: number;
  amountBaseUSD?: number;
  currency?: string;
  conversionRate?: number;

  status: EscrowStatus;
  heldAt: Date;
  releasedAt?: Date;
  refundedAt?: Date;

  milestoneId?: Types.ObjectId;
  description: string;
  purpose: string;

  createdAt?: Date;
  updatedAt?: Date;
}
