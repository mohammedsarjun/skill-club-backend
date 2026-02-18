import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import { IClientJobService } from './interfaces/client-job-service.interface';
import {
  ClientJobDetailResponseDTO,
  ClientJobResponseDto,
  CreateJobDto,
  PaginatedClientJobDto,
  UpdateJobDto,
} from '../../dto/clientDTO/client-job.dto';

import AppError from '../../utils/app-error';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import {
  mapCreateJobDtoToJobModel,
  mapJobModelDtoToClientJobResponseDto,
  mapJobModelToClientJobDetailResponseDTO,
  mapUpdateJobDtoToJobModel,
} from '../../mapper/clientMapper/client-job.mapper';
import { validateData } from '../../utils/validation';
import { createJobSchema, updateJobSchema } from '../../utils/validationSchemas/job-validations';
import { IJobDetail } from '../../models/interfaces/job.model.interface';
import { IJobRepository } from '../../repositories/interfaces/job-repository.interface';
import { IClientRepository } from '../../repositories/interfaces/client-repository.interface';
import { ISkillRepository } from '../../repositories/interfaces/skill-repository.interface';
import { Types } from 'mongoose';
import { ISpecialityRepository } from '../../repositories/interfaces/speciality-repository.interface';
import { ICategoryRepository } from '../../repositories/interfaces/category-repository.interface';
import { IProposalRepository } from '../../repositories/interfaces/proposal-repository.interface';
import { JobQueryParams } from '../../dto/commonDTO/job-common.dto';
import { mapJobQuery } from '../../mapper/commonMapper/common-job-mapper';

@injectable()
export class ClientJobService implements IClientJobService {
  private _jobRepository: IJobRepository;
  private _clientRepository: IClientRepository;
  private _skillRepository: ISkillRepository;
  private _specialityRespository: ISpecialityRepository;
  private _categoryRepository: ICategoryRepository;
  private _proposalRepository: IProposalRepository;

  constructor(
    @inject('IJobRepository') jobRepository: IJobRepository,
    @inject('IClientRepository') clientRepository: IClientRepository,
    @inject('ISkillRepository') skillRepository: ISkillRepository,
    @inject('ISpecialityRepository') specialityRespository: ISpecialityRepository,
    @inject('ICategoryRepository') categoryRepository: ICategoryRepository,
    @inject('IProposalRepository') proposalRepository: IProposalRepository,
  ) {
    this._jobRepository = jobRepository;
    this._clientRepository = clientRepository;
    this._skillRepository = skillRepository;
    this._specialityRespository = specialityRespository;
    this._categoryRepository = categoryRepository;
    this._proposalRepository = proposalRepository;
  }

  async createJob(clientId: string, jobData: CreateJobDto): Promise<ClientJobDetailResponseDTO> {
    validateData(createJobSchema, jobData);
    const clientData = await this._clientRepository.getClientById(clientId);
    if (!clientData || !clientData.clientProfile) {
      throw new AppError(ERROR_MESSAGES.CLIENT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const jobModelData = mapCreateJobDtoToJobModel(jobData, clientId);

    const foundCategories = await this._categoryRepository.getCategory(
      jobModelData.category as string,
    );

    if (!foundCategories) {
      throw new AppError(
        'selected Category not found. Please review and fill in the project details again.',
        HttpStatus.NOT_FOUND,
      );
    }

    const foundSkills = await this._skillRepository.getListedSkillsByIds(
      jobModelData.skills as Types.ObjectId[],
    );

    if (foundSkills?.length !== jobModelData?.skills?.length) {
      throw new AppError(
        'Some selected skills were not found. Please review and fill in the project details again.',
        HttpStatus.NOT_FOUND,
      );
    }

    const foundSpecialities = await this._specialityRespository.getListedSpecialitiesByIds(
      jobModelData.specialities as Types.ObjectId[],
    );

    if (foundSpecialities?.length !== jobModelData?.specialities?.length) {
      throw new AppError(
        'Some selected specialities were not found. Please review and fill in the job details again.',
        HttpStatus.NOT_FOUND,
      );
    }

    const createdJob = await this._jobRepository.createJob(jobModelData);

    const job = await this._jobRepository.getJobById(createdJob?._id as string);

    const proposalCount = await this._proposalRepository.countProposalsByJobId(
      job?._id?.toString()!,
    );
    const responseJobData = mapJobModelToClientJobDetailResponseDTO(
      job as IJobDetail,
      proposalCount,
    );

    return responseJobData;
  }

  async getAllJobs(clientId: string, queryParams: JobQueryParams): Promise<PaginatedClientJobDto> {
    const JobQueryDto = mapJobQuery(queryParams);

    const skip = (JobQueryDto.page - 1) * JobQueryDto.limit;
    const JobResponse = await this._jobRepository.getAllJobsByClientId(clientId, JobQueryDto, skip);

    if (!JobResponse) {
      throw new AppError(ERROR_MESSAGES.JOB.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const JobResponseDTO: ClientJobResponseDto[] = JobResponse.map(
      mapJobModelDtoToClientJobResponseDto,
    );

    const total = await this._jobRepository.countAllJobsByClientId(clientId);

    return {
      data: JobResponseDTO,
      total,
      page: JobQueryDto.page,
      limit: JobQueryDto.limit,
    };
  }

  async getJobDetail(clientId: string, jobId: string): Promise<ClientJobDetailResponseDTO> {
    const clientData = await this._clientRepository.getClientById(clientId);
    if (!clientData || !clientData.clientProfile) {
      throw new AppError(ERROR_MESSAGES.CLIENT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const job = await this._jobRepository.getJobByClientAndJobId(clientId, jobId);
    if (!job) {
      throw new AppError(ERROR_MESSAGES.JOB.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const proposalCount = await this._proposalRepository.countProposalsByJobId(jobId);
    const responseJobData = mapJobModelToClientJobDetailResponseDTO(job, proposalCount);
    return responseJobData;
  }

  async updateJobDetail(
    clientId: string,
    jobId: string,
    jobData: UpdateJobDto,
  ): Promise<ClientJobDetailResponseDTO> {
    validateData(updateJobSchema, jobData);
    const clientData = await this._clientRepository.getClientById(clientId);
    if (!clientData || !clientData.clientProfile) {
      throw new AppError(ERROR_MESSAGES.CLIENT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const job = await this._jobRepository.getJobByClientAndJobId(clientId, jobId);
    if (!job) {
      throw new AppError(ERROR_MESSAGES.JOB.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const jobDataDto = mapUpdateJobDtoToJobModel(jobData);

    await this._jobRepository.updateJobById(jobId, jobDataDto);

    const jobModelDto = await this._jobRepository.getJobById(jobId);

    const proposalCount = await this._proposalRepository.countProposalsByJobId(jobId);
    const responseJobData = mapJobModelToClientJobDetailResponseDTO(
      jobModelDto as IJobDetail,
      proposalCount,
    );

    return responseJobData;
  }

  async closeJob(clientId: string, jobId: string): Promise<void> {
    const clientData = await this._clientRepository.getClientById(clientId);
    if (!clientData || !clientData.clientProfile) {
      throw new AppError(ERROR_MESSAGES.CLIENT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const job = await this._jobRepository.getJobByClientAndJobId(clientId, jobId);
    if (!job) {
      throw new AppError(ERROR_MESSAGES.JOB.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (
      job.status === 'closed' ||
      (job.status !== 'open' && job.status !== 'pending_verification')
    ) {
      throw new AppError(ERROR_MESSAGES.JOB.INVALID_STATUS, HttpStatus.BAD_REQUEST);
    }

    await this._jobRepository.updateJobStatus(jobId, 'closed');
  }
}
