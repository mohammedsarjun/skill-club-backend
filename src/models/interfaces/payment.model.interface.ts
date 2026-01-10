import { Document, Types } from 'mongoose';

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled';
export type PaymentGateway = 'payu' | 'razorpay' | 'stripe';
export type PaymentPurpose = 'contract_funding' | 'milestone_funding' | 'hourly_advance';

export interface IPayment extends Document {
  paymentId: string;
  contractId: Types.ObjectId;
  clientId: Types.ObjectId;
  freelancerId: Types.ObjectId;
  isMilestonePayment: boolean;
  milestoneId?: Types.ObjectId;
  purpose: PaymentPurpose;
  amount: number;
  amountBaseUSD?: number;
  currency?: string;
  conversionRate?: number;

  gateway: PaymentGateway;
  gatewayTransactionId?: string;
  gatewayOrderId?: string;
  gatewayResponse?: Record<string, unknown>;

  status: PaymentStatus;
  paidAt?: Date;
  failedReason?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
