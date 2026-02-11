import { ContractStatus } from '../../models/interfaces/contract.model.interface';

export interface FreelancerContractQueryParamsDTO {
  search?: string;
  page?: number;
  limit?: number;
  filters: {
    status?: ContractStatus;
  };
}

export interface FreelancerContractListItemDTO {
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
}

export interface FreelancerContractListResultDTO {
  items: FreelancerContractListItemDTO[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface FreelancerContractDetailDTO {
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

  paymentType: 'fixed' | 'fixed_with_milestones' | 'hourly';
  budget?: number;
  hourlyRate?: number;
  estimatedHoursPerWeek?: number;

  milestones?: {
    milestoneId: string;
    title: string;
    amount: number;
    expectedDelivery: Date;
  status: 'pending_funding' | 'funded' | 'under_review' | 'submitted' | 'approved' | 'paid' | 'changes_requested'|   'cancelled';
    submittedAt?: Date;
    approvedAt?: Date;
    revisionsAllowed?: number;
    deliverables?: {
      id: string;
      submittedBy: string;
      files: { fileName: string; fileUrl: string }[];
      message?: string;
      status: 'submitted' | 'approved' | 'changes_requested';
      version: number;
      submittedAt: Date;
      approvedAt?: Date;
      revisionsRequested?: number;
      revisionsAllowed?: number;
      revisionsLeft?: number;
    }[];
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
    revisionsRequested?: number;
    revisionsAllowed?: number;
    revisionsLeft?: number;
  }[];

  title: string;
  description: string;
  expectedStartDate: Date;
  expectedEndDate: Date;
  referenceFiles: { fileName: string; fileUrl: string }[];
  referenceLinks: { description: string; link: string }[];

  extensionRequest?: {
    requestedBy: string;
    requestedDeadline: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
    respondedAt?: string;
    responseMessage?: string;
  };

  reporting?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dueTimeUtc: string;
    dueDayOfWeek?: string;
    dueDayOfMonth?: number;
    format: 'text_with_attachments' | 'text_only' | 'video';
  };

  status: 'pending_funding' | 'held' | 'active' | 'completed' | 'cancelled' | 'refunded' | 'disputed' | 'cancellation_requested';
  totalFunded: number;
  totalPaidToFreelancer: number;
  totalCommissionPaid: number;
  totalAmountHeld: number;
  totalRefund: number;
  availableContractBalance: number;
  cancelledBy?: 'client' | 'freelancer';
hasActiveCancellationDisputeWindow?: boolean; 
  createdAt?: Date;
  updatedAt?: Date;
}
