export interface CreateProposalRequestDto {
  jobId: string;
  hourlyRate?: number;
  availableHoursPerWeek?: number;
  proposedBudget?: number;
  deadline?: Date;
  coverLetter: string;
}

export interface FreelancerProposalResponseDTO {
  proposalId: string;
  jobDetail: {
    _id: string;
    title: string;
    description: string;
    clientId: string;
  };
  hourlyRate: number;
  availableHoursPerWeek: number;
  proposedBudget?: number;
  deadline?: Date;
  coverLetter: string;
  status: 'pending_verification' | 'accepted' | 'rejected' | 'offer_sent';
  proposedAt: Date;
}
