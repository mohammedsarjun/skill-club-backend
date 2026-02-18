import { IWorklog } from 'src/models/interfaces/worklog.model.interface';

export interface AdminDisputeQueryParamsDTO {
  search?: string;
  page?: number;
  limit?: number;
  filters: {
    reasonCode?: string;
  };
}

export interface AdminDisputeListItemDTO {
  id: string;
  disputeId: string;
  contractTitle: string;
  raisedBy: {
    name: string;
    role: 'client' | 'freelancer' | 'system';
  };
  reasonCode: string;
  status: string;
  createdAt: Date;
}

export interface AdminDisputeListResultDTO {
  items: AdminDisputeListItemDTO[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AdminDisputeDetailDTO {
  disputeId: string;
  contractId: string;
  raisedBy: 'client' | 'freelancer' | 'system';
  scope: 'contract' | 'milestone' | 'worklog';
  scopeId: string | null;
  contractType: 'hourly' | 'fixed' | 'fixed_with_milestones';
  reasonCode: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  contract: {
    contractId: string;
    title: string;
    description: string;
    paymentType: 'fixed' | 'fixed_with_milestones' | 'hourly';
    budget?: number;
    hourlyRate?: number;
    status: string;
    expectedStartDate: string;
    expectedEndDate: string;
    fundedAmount: number;
    totalPaid: number;
    balance: number;
    client: {
      clientId: string;
      firstName: string;
      lastName: string;
      companyName?: string;
    };
    freelancer: {
      freelancerId: string;
      firstName: string;
      lastName: string;
    };
  };
  holdTransaction?: {
    transactionId: string;
    amount: number;
    description: string;
    createdAt: string;
  };
  milestones?: Array<{
    id: string;
    milestoneId: string;
    title: string;
    amount: number;
    expectedDelivery: string;
    status: string;
    submittedAt?: string;
    approvedAt?: string;
    deliverables?: Array<{
      id: string;
      submittedBy: string;
      files: Array<{ fileName: string; fileUrl: string }>;
      message?: string;
      status: string;
      version: number;
      submittedAt: string;
      approvedAt?: string;
    }>;
  }>;
  deliverables?: Array<{
    id: string;
    submittedBy: string;
    files: Array<{ fileName: string; fileUrl: string }>;
    message?: string;
    status: string;
    version: number;
    submittedAt: string;
    approvedAt?: string;
  }>;
  workLog?: Partial<IWorklog>;
}
