import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IFreelancerProposalService } from './interfaces/freelancer-proposal-service.interface';
import { IProposalRepository } from '../../repositories/interfaces/proposal-repository.interface';
import {
  CreateProposalRequestDto,
  FreelancerProposalResponseDTO,
} from '../../dto/freelancerDTO/freelancer-proposal.dto';
import { validateData } from '../../utils/validation';
import {
  fixedProposalSchema,
  hourlyProposalSchema,
} from '../../utils/validationSchemas/proposal-validation';
import { IJobRepository } from '../../repositories/interfaces/job-repository.interface';
import AppError from '../../utils/app-error';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { HttpStatus } from '../../enums/http-status.enum';
import {
  mapCreateProposalRequestDtoToProposalModel,
  mapProposalModelToFreelancerProposalResponseDTO,
} from '../../mapper/freelancerMapper/freelancer-proposal.mapper';
import { mapRawQueryFiltersToProposalQueryParamsDTO } from '../../mapper/clientMapper/client-proposal.mapper';
// import AppError from '../../utils/app-error';
// import { HttpStatus } from '../../enums/http-status.enum';

@injectable()
export class FreelancerProposalService implements IFreelancerProposalService {
  private _proposalRepository: IProposalRepository;
  private _jobRepository: IJobRepository;
  constructor(
    @inject('IProposalRepository') proposalRepository: IProposalRepository,
    @inject('IJobRepository') jobRepository: IJobRepository,
  ) {
    this._proposalRepository = proposalRepository;
    this._jobRepository = jobRepository;
  }

  async createProposal(
    freelancerId: string,
    proposalData: CreateProposalRequestDto,
  ): Promise<void> {
    const jobData = await this._jobRepository.getJobById(proposalData.jobId);
    if (!jobData) {
      throw new AppError(ERROR_MESSAGES.JOB.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const jobRateType = jobData.rateType;

    if (jobRateType == 'hourly') {
      validateData(hourlyProposalSchema, proposalData);
    } else {
      validateData(fixedProposalSchema, proposalData);
    }

    const existProposal = await this._proposalRepository.findOneByFreelancerAndJobId(
      freelancerId,
      jobData._id as string,
    );

    if (existProposal) {
      throw new AppError(ERROR_MESSAGES.PROPOSAL.ALREADY_EXIST, HttpStatus.CONFLICT);
    }

    const proposalDbData = mapCreateProposalRequestDtoToProposalModel(
      proposalData,
      jobRateType,
      freelancerId,
    );

    await this._proposalRepository.createProposal(proposalDbData);
  }

  async getAllProposal(
    freelancerId: string,
    jobId: string,
    queryFilters: Record<string, unknown>,
  ): Promise<FreelancerProposalResponseDTO[] | null> {
    const proposalQueryDto = mapRawQueryFiltersToProposalQueryParamsDTO(queryFilters);
    const skip =
      (proposalQueryDto?.page ? proposalQueryDto?.page - 1 : 0) *
      (proposalQueryDto.limit ? proposalQueryDto?.limit : 5);

    const proposalResponse = await this._proposalRepository.findAllByJobAndFreelancerId(
      freelancerId,
      jobId,
      proposalQueryDto,
      skip,
    );

    const proposalResponseDTO = proposalResponse?.map(
      mapProposalModelToFreelancerProposalResponseDTO,
    );
    return proposalResponseDTO || null;
  }
}
