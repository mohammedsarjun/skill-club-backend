import {
  CreateProposalRequestDto,
  FreelancerProposalResponseDTO,
} from '../../../dto/freelancerDTO/freelancer-proposal.dto';

export interface IFreelancerProposalService {
  createProposal(freelancerId: string, proposalData: CreateProposalRequestDto): Promise<void>;
  getAllProposal(
    freelancerId: string,
    jobId: string,
    queryFilters: Record<string, unknown>,
  ): Promise<FreelancerProposalResponseDTO[] | null>;
}
