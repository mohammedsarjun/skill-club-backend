export interface ProposalQueryParamsDTO {
  search?: string;
  page?: number;
  limit?: number;
  filters: {};
  status?: 'pending_verification' | 'offer_sent' | 'rejected' | '';
}
export interface ClientProposalResponseDTO {
  proposalId: string;
  freelancer: {
    freelancerId: string;
    firstName: string;
    lastName: string;
    avatar: string;
    country: string;
  };
  proposedBudget?: number;
  deadline?: Date;
  hourlyRate: number;
  availableHoursPerWeek: number;
  coverLetter: string;
  status: 'pending_verification' | 'accepted' | 'rejected' | 'offer_sent';
  proposedAt: Date;
}
