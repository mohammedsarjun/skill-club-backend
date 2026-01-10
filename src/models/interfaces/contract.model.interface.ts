import { Document, Types } from 'mongoose';

export type ContractStatus = 'pending_funding' | 'held' | 'active' | 'completed' | 'cancelled' | 'refunded' | 'disputed';

export type MilestoneStatus = 'pending_funding' | 'funded'|'changes_requested' | 'submitted' | 'approved' | 'paid';

export interface MilestoneDeliverable {
  _id?: Types.ObjectId;
  submittedBy: Types.ObjectId;
  files: { fileName: string; fileUrl: string }[];
  message?: string;
  status: 'submitted' | 'approved' | 'changes_requested';
  version: number;
  submittedAt: Date;
  approvedAt?: Date;
  revisionsRequested?: number;
}

export interface MilestoneExtensionRequest {
  requestedBy: Types.ObjectId;
  requestedDeadline: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  respondedAt?: Date;
  responseMessage?: string;
}

export interface ContractMilestone {
  _id?: Types.ObjectId;
  title: string;
  amount: number;
  amountBaseUSD?: number;
  expectedDelivery: Date;
  status: MilestoneStatus;
  submittedAt?: Date;
  approvedAt?: Date;
  revisionsAllowed?: number;
  deliverables?: MilestoneDeliverable[];
  extensionRequest?: MilestoneExtensionRequest;
}

export interface ContractDeliverable {
  _id?: Types.ObjectId;
  submittedBy: Types.ObjectId;
  files: { fileName: string; fileUrl: string }[];
  message?: string;
  status: 'submitted' | 'approved' | 'changes_requested';
  version: number;
  submittedAt: Date;
  approvedAt?: Date;
  revisionsRequested?: number;
}

export interface HourLog {
  date: Date;
  hours: number;
}

export interface ContractTimesheet {
  weekStart: Date;
  weekEnd: Date;
  totalHours: number;
  totalAmount: number;
  status: 'pending' | 'approved' | 'paid';
  hoursLogged: HourLog[];
}

export interface ContractCommunication {
  preferredMethod: 'chat' | 'video_call' | 'email' | 'mixed';
  meetingFrequency?: 'daily' | 'weekly' | 'monthly';
  meetingDayOfWeek?:
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday';
  meetingDayOfMonth?: number; // 1..31 when monthly
  meetingTimeUtc?: string; // HH:mm
}

export interface ContractReporting {
  frequency: 'daily' | 'weekly' | 'monthly';
  dueTimeUtc: string; // HH:mm
  dueDayOfWeek?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  dueDayOfMonth?: number; // 1..31 when monthly
  format: 'text_with_attachments' | 'text_only' | 'video';
}

export interface TimelineEntry {
  _id?: Types.ObjectId;
  action: string;
  performedBy: Types.ObjectId;
  milestoneId?: Types.ObjectId;
  details?: string;
  timestamp: Date;
}

export interface ContractExtensionRequest {
  requestedBy: Types.ObjectId;
  requestedDeadline: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  respondedAt?: Date;
  responseMessage?: string;
}

export interface IContract extends Document {
  contractId: string;

  // Link to offer
  offerId: Types.ObjectId;

  // Parties
  clientId: Types.ObjectId;
  freelancerId: Types.ObjectId;

  // Optional references
  jobId?: Types.ObjectId;
  proposalId?: Types.ObjectId;

  // Payment info
  paymentType: 'fixed' | 'fixed_with_milestones' | 'hourly';
  budget?: number;
  budgetBaseUSD?: number;
  hourlyRate?: number;
  hourlyRateBaseUSD?: number;
  currency?: string;
  conversionRate?: number;
  estimatedHoursPerWeek?: number;

  // Milestones
  milestones?: ContractMilestone[];
  // Allowed revisions copied from offer
  revisions?: number;
  revisionAllowed?: number;

  // Hourly tracking
  timesheets?: ContractTimesheet[];

  // Deliverables
  deliverables?: ContractDeliverable[];

  // Extension request for fixed contracts
  extensionRequest?: ContractExtensionRequest;

  // Timeline tracking
  timeline?: TimelineEntry[];

  // Project details
  title: string;
  description: string;
  expectedStartDate: Date;
  expectedEndDate: Date;
  referenceFiles: { fileName: string; fileUrl: string }[];
  referenceLinks: { description: string; link: string }[];
  communication: ContractCommunication;
  reporting: ContractReporting;

  // Contract lifecycle
  status: ContractStatus;
  fundedAmount: number;
  totalPaid: number;
  balance: number;

  createdAt?: Date;
  updatedAt?: Date;
}
