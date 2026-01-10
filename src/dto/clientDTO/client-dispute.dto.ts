export interface CreateDisputeRequestDTO {
  contractId: string;
  reasonCode: string;
  description: string;
  scope?: 'contract' | 'milestone' | 'worklog';
  scopeId?: string;
}

export interface DisputeResponseDTO {
  disputeId: string;
  contractId: string;
  contractType: 'hourly' | 'fixed' | 'fixed_with_milestones';
  raisedBy: 'client' | 'freelancer' | 'system';
  scope: 'contract' | 'milestone' | 'worklog';
  scopeId: string | null;
  reasonCode: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'rejected';
  resolution?: {
    outcome: 'refund_client' | 'pay_freelancer' | 'split';
    clientAmount: number;
    freelancerAmount: number;
    decidedBy: 'admin' | 'system';
    decidedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}
