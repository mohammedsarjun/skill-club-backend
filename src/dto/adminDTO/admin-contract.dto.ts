import { ContractStatus } from '../../models/interfaces/contract.model.interface';

export interface AdminContractQueryParamsDTO {
  search?: string;
  page?: number;
  limit?: number;
  filters: {
    status?: ContractStatus;
  };
}

export interface AdminContractListItemDTO {
  id: string;
  contractId: string;
  title: string;
  paymentType: 'fixed' | 'fixed_with_milestones' | 'hourly';
  budget?: number;
  hourlyRate?: number;
  status: string;
  createdAt: Date;
  client?: {
    clientId: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    logo?: string;
  };
  freelancer?: {
    freelancerId: string;
    firstName?: string;
    lastName?: string;
    logo?: string;
  };
}

export interface AdminContractListResultDTO {
  items: AdminContractListItemDTO[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AdminContractDetailDTO {
  contractId: string;
  offerId: string;
  offerType?: 'direct' | 'proposal';
  jobId?: string;
  jobTitle?: string;
  proposalId?: string;

  client?: {
    clientId: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    logo?: string;
    country?: string;
  };

  freelancer?: {
    freelancerId: string;
    firstName?: string;
    lastName?: string;
    logo?: string;
    country?: string;
    rating?: number;
  };

  paymentType: 'fixed' | 'fixed_with_milestones' | 'hourly';
  budget?: number;
  hourlyRate?: number;
  estimatedHoursPerWeek?: number;

  milestones?: {
    milestoneId: string;
    title: string;
    amount: number;
    expectedDelivery: Date;
    status: 'pending_funding' | 'funded' | 'under_review' | 'submitted' | 'approved' | 'paid' | 'changes_requested' | 'cancelled';
    submittedAt?: Date;
    approvedAt?: Date;
  }[];

  timesheets?: {
    weekStart: Date;
    weekEnd: Date;
    totalHours: number;
    totalAmount: number;
    status: 'pending' | 'approved' | 'paid';
  }[];

  deliverables?: {
    submittedBy: string;
    files: { fileName: string; fileUrl: string }[];
    message?: string;
    status: 'submitted' | 'approved' | 'changes_requested';
    submittedAt: Date;
    approvedAt?: Date;
  }[];

  title: string;
  description: string;
  expectedStartDate: Date;
  expectedEndDate: Date;
  referenceFiles: { fileName: string; fileUrl: string }[];
  referenceLinks: { description: string; link: string }[];

  communication?: {
    preferredMethod: 'chat' | 'video_call' | 'email' | 'mixed';
    meetingFrequency?: 'daily' | 'weekly' | 'monthly';
    meetingDayOfWeek?: string;
    meetingDayOfMonth?: number;
    meetingTimeUtc?: string;
  };

  reporting?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dueTimeUtc: string;
    dueDayOfWeek?: string;
    dueDayOfMonth?: number;
    format: 'text_with_attachments' | 'text_only' | 'video';
  };

  status: 'pending_funding' | 'held' | 'active' | 'completed' | 'cancelled' | 'refunded' | 'disputed' | 'cancellation_requested';
  fundedAmount: number;
  totalPaid: number;
  balance: number;

  createdAt?: Date;
  updatedAt?: Date;
}
