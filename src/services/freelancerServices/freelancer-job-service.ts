import { injectable, inject } from 'tsyringe';
import '../../config/container';
// import AppError from '../../utils/app-error';
// import { HttpStatus } from '../../enums/http-status.enum';

import { IFreelancerJobService } from './interfaces/freelancer-job-service.interface';
import { IJobRepository } from '../../repositories/interfaces/job-repository.interface';
import {
  FreelancerJobDetailResponseDto,
  FreelancerJobFiltersDto,
  FreelancerJobResponseDto,
} from '../../dto/freelancerDTO/freelancer-job.dto';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { mapuserModelToFreelancerClientMinimalDTO } from '../../mapper/freelancerMapper/freelancer-client.mapper';
import { IClientRepository } from '../../repositories/interfaces/client-repository.interface';
import {
  mapFreelancerJobRawFilterToFreelancerJobFiltersDto,
  mapJobModelToFreelancerJobDetailResponseDTO,
  mapJobModelToFreelancerJobResponseDTO,
} from '../../mapper/freelancerMapper/freelancer-job.mapper';
import { IProposalRepository } from '../../repositories/interfaces/proposal-repository.interface';

@injectable()
export class FreelancerJobService implements IFreelancerJobService {
  private _jobRepository: IJobRepository;
  private _clientRepository: IClientRepository;
  private _proposalRepository:IProposalRepository
  constructor(
    @inject('IJobRepository') jobRepository: IJobRepository,
    @inject('IClientRepository') clientRepository: IClientRepository,
    @inject('IProposalRepository') proposalRepository: IProposalRepository,
  ) {
    this._jobRepository = jobRepository;
    this._clientRepository = clientRepository;
    this._proposalRepository=proposalRepository
  }

  async getAllJobs(
    freelancerUserId: string,
    filters: FreelancerJobFiltersDto,
  ): Promise<FreelancerJobResponseDto[] | null> {
    const jobFilterDto = mapFreelancerJobRawFilterToFreelancerJobFiltersDto(filters);

    const page = Number(filters?.page);
    const limit = Number(filters?.limit);
    const paginationData = { page, limit };
    const jobData = await this._jobRepository.findAllWithFreelancerFilters(
      freelancerUserId,
      jobFilterDto,
      paginationData,
    );

    const freelancerJobResponseDto = jobData
      ? jobData.map(mapJobModelToFreelancerJobResponseDTO)
      : null;
    return freelancerJobResponseDto;
  }

  async getJobDetail(
    freelancerUserId: string,
    jobId: string,
  ): Promise<FreelancerJobDetailResponseDto> {
    const jobData = await this._jobRepository.getJobById(jobId);

    if (jobData?.clientId._id == freelancerUserId) {
      throw new AppError('You cannot view your own freelancer profile.', HttpStatus.BAD_REQUEST);
    }

    if (jobData?.status == 'pending_verification' || jobData?.status == 'rejected' || !jobData) {
      throw new AppError(ERROR_MESSAGES.JOB.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const { clientId } = jobData;

    const userData = await this._clientRepository.getClientById(clientId._id);
    const totalJobsPosted = await this._jobRepository.countAllJobsByClientId(clientId._id);
    const clientMinimalData = mapuserModelToFreelancerClientMinimalDTO(userData!, totalJobsPosted);
    const isProposalAlreadySent=await this._proposalRepository.findProposalByFreelancerAndJobId(freelancerUserId,jobId)
    const proposalCount = await this._proposalRepository.countProposalsByJobId(jobId);
    const jobDetailData = mapJobModelToFreelancerJobDetailResponseDTO(jobData, clientMinimalData,isProposalAlreadySent?true:false, proposalCount);

    return jobDetailData;
  }
}
