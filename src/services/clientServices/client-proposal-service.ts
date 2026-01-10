import { injectable, inject } from 'tsyringe';
import '../../config/container';
// import AppError from '../../utils/app-error';
// import { HttpStatus } from '../../enums/http-status.enum';
import { IClientProposalService } from './interfaces/client-proposal-service.interface';
// import { ProposalQueryParamsDTO } from 'src/dto/clientDTO/client-proposal.dto';
import { IProposalRepository } from '../../repositories/interfaces/proposal-repository.interface';
import { IJobRepository } from '../../repositories/interfaces/job-repository.interface';
import AppError from '../../utils/app-error';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { HttpStatus } from '../../enums/http-status.enum';
import {
  mapProposalModelToClientProposalResponseDTO,
  mapRawQueryFiltersToProposalQueryParamsDTO,
} from '../../mapper/clientMapper/client-proposal.mapper';
import { ClientProposalResponseDTO } from '../../dto/clientDTO/client-proposal.dto';
// import { mapRawQueryFiltersToProposalQueryParamsDTO } from 'src/mapper/clientMapper/client-proposal.mapper';
// import { ERROR_MESSAGES } from 'src/contants/error-constants';

@injectable()
export class ClientProposalService implements IClientProposalService {
  private _proposalRepository: IProposalRepository;
  private _jobRepository: IJobRepository;
  constructor(
    @inject('IProposalRepository') proposalRepository: IProposalRepository,
    @inject('IJobRepository') jobRepository: IJobRepository,
  ) {
    this._proposalRepository = proposalRepository;
    this._jobRepository = jobRepository;
  }

  async getAllProposal(
    clientId: string,
    jobId: string,
    queryFilters: Record<string, unknown>,
  ): Promise<ClientProposalResponseDTO[] | null> {
    console.log(queryFilters);
    const proposalQueryDto = mapRawQueryFiltersToProposalQueryParamsDTO(queryFilters);

    const skip =
      (proposalQueryDto?.page ? proposalQueryDto?.page - 1 : 0) *
      (proposalQueryDto.limit ? proposalQueryDto?.limit : 5);
    const proposalResponse = await this._proposalRepository.findAllByJobAndClientId(
      clientId,
      jobId,
      proposalQueryDto,
      skip,
    );

    const proposalResponseDTO = proposalResponse?.map(mapProposalModelToClientProposalResponseDTO);

    return proposalResponseDTO || null;
  }
  async getProposalDetail(proposalId: string): Promise<ClientProposalResponseDTO | null> {
    const proposal = await this._proposalRepository.findOneById(proposalId);
    if (!proposal) {
      return null;
    }
    return mapProposalModelToClientProposalResponseDTO(proposal);
  }

  async rejectProposal(clientId: string, proposalId: string): Promise<{ rejected: boolean }> {
    // Ensure proposal exists
    const proposal = await this._proposalRepository.findOneById(proposalId);
    if (!proposal) {
      throw new AppError(ERROR_MESSAGES.PROPOSAL.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Verify the client owns the job linked to this proposal
    const jobId = proposal?.jobId?.toString() || '';
    if (!jobId) {
      throw new AppError('Invalid proposal data', HttpStatus.BAD_REQUEST);
    }

    // Use job repository to verify ownership
    const job = await this._jobRepository.getJobByClientAndJobId(clientId, jobId);
    if (!job) {
      throw new AppError('You are not authorized to reject this proposal', HttpStatus.FORBIDDEN);
    }

    // Update proposal status to 'rejected'
    await this._proposalRepository.updateStatusById(proposalId, 'rejected');

    return { rejected: true };
  }
}
