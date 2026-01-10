import { ClientProposalResponseDTO } from '../../../dto/clientDTO/client-proposal.dto';

export interface IClientProposalService {
  getAllProposal(
    clientId: string,
    jobId: string,
    queryFilters: Record<string, unknown>,
  ): Promise<ClientProposalResponseDTO[] | null>;
  getProposalDetail(proposalId: string): Promise<ClientProposalResponseDTO | null>;
  rejectProposal(clientId: string, proposalId: string): Promise<{ rejected: boolean }>;
}
