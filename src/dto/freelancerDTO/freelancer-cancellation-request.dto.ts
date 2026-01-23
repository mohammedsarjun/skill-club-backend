export interface FreelancerCancellationRequestDTO {
  cancellationRequestId: string;
  contractId: string;
  initiatedBy: 'client' | 'freelancer';
  reason: string;
  clientSplitPercentage: number;
  freelancerSplitPercentage: number;
  totalHeldAmount: number;
  clientAmount: number;
  freelancerAmount: number;
  status: 'pending' | 'accepted' | 'disputed' | 'rejected' | 'cancelled';
  respondedAt?: string;
  responseMessage?: string;
  createdAt: string;
}

export interface AcceptCancellationRequestDTO {
  responseMessage?: string;
}

export interface RejectCancellationRequestDTO {
  responseMessage: string;
}
