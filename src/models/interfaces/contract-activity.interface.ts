import { Types } from 'mongoose';

export type ActorRole = 'client' | 'freelancer' | 'system' | 'admin';

export type ContractEventType =
  | 'contract_created'
  | 'fixed_contract_funded'
  | 'milestone_funded'
  | 'hourly_contract_funded'
  | 'deliverable_submitted'
  | 'deliverable_approved'
  | 'deliverable_rejected'
  | 'revision_requested'
  | 'work_logged'
  | 'work_log_approved'
  | 'work_log_rejected'
  | 'milestone_completed'
  | 'payment_released'
  | 'dispute_raised'
  | 'meeting_attended';

export interface IContractActivity {
  _id: Types.ObjectId;

  contractId: Types.ObjectId;

  actor: {
    role: ActorRole;
    userId?: Types.ObjectId;
  };

  eventType: ContractEventType;

  title: string;
  description: string;

  metadata?: {
    amount?: number;
    milestoneId?: Types.ObjectId;
    messageId?: Types.ObjectId;
    reason?: string;
  };

  createdAt: Date;
}
