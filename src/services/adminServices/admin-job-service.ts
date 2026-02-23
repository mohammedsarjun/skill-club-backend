import { injectable, inject } from 'tsyringe';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { IAdminJobService } from './interfaces/admin-job-service.interface';
import { IJobRepository } from '../../repositories/interfaces/job-repository.interface';
import {
  mapJobModelToAdminJobDetailResponseDTO,
  mapJobModelToAdminJobResponseDTO,
} from '../../mapper/adminMapper/admin-job-mapper';

import { ERROR_MESSAGES } from '../../contants/error-constants';
import { JobQueryParams } from '../../dto/commonDTO/job-common.dto';
import {
  AdminJobDetailResponseDTO,
  AdminJobResponseDTO,
  PaginatedAdminJobDto,
} from '../../dto/adminDTO/admin-job.dto';
import { mapJobQuery } from '../../mapper/commonMapper/common-job-mapper';
import { INotificationService } from '../commonServices/interfaces/notification-service.interface';
@injectable()
export class AdminJobService implements IAdminJobService {
  private _jobRepository: IJobRepository;
  private _notificationService: INotificationService;

  constructor(
    @inject('IJobRepository')
    jobRepository: IJobRepository,
    @inject('INotificationService')
    notificationService: INotificationService,
  ) {
    this._jobRepository = jobRepository;
    this._notificationService = notificationService;
  }

  async getAllJobs(queryParams: JobQueryParams): Promise<PaginatedAdminJobDto> {
    const JobQueryDto = mapJobQuery(queryParams);

    const skip = (JobQueryDto.page - 1) * JobQueryDto.limit;

    const JobResponse = await this._jobRepository.getAllJobs(JobQueryDto, skip);

    if (!JobResponse) {
      throw new AppError(ERROR_MESSAGES.JOB.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const JobResponseDTO: AdminJobResponseDTO[] = JobResponse.map(mapJobModelToAdminJobResponseDTO);
    const total = await this._jobRepository.countAllJobs();

    return {
      data: JobResponseDTO,
      total,
      page: JobQueryDto.page,
      limit: JobQueryDto.limit,
    };
  }

  async getJobDetail(jobId: string): Promise<AdminJobDetailResponseDTO> {
    const job = await this._jobRepository.getJobById(jobId);
    if (!job) {
      throw new AppError(ERROR_MESSAGES.JOB.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const JobDetailResponseDTO: AdminJobDetailResponseDTO =
      mapJobModelToAdminJobDetailResponseDTO(job);

    return JobDetailResponseDTO;
  }

  async approveJob(jobId: string): Promise<AdminJobDetailResponseDTO> {
    const job = await this._jobRepository.getJobById(jobId);
    if (!job) {
      throw new AppError(ERROR_MESSAGES.JOB.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (job.status !== 'pending_verification') {
      throw new AppError(ERROR_MESSAGES.JOB.INVALID_STATUS, HttpStatus.BAD_REQUEST);
    }
    await this._jobRepository.updateJobStatus(jobId, 'open');

    const updatedJob = await this._jobRepository.getJobById(jobId);
    if (!updatedJob) {
      throw new AppError(ERROR_MESSAGES.JOB.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const clientIdStr = (updatedJob.clientId as any)._id?.toString() || updatedJob.clientId.toString();

    await this._notificationService.createAndEmitNotification(clientIdStr, {
      role: 'client',
      title: 'Job Approved',
      message: `Your job "${updatedJob.title}" has been approved and is now open.`,
      type: 'job',
      relatedId: jobId,
    });

    const updatedJobDto: AdminJobDetailResponseDTO =
      mapJobModelToAdminJobDetailResponseDTO(updatedJob);

    return updatedJobDto;
  }

  async rejectJob(jobId: string, rejectedReason: string): Promise<AdminJobDetailResponseDTO> {
    const job = await this._jobRepository.getJobById(jobId);
    if (!job) {
      throw new AppError(ERROR_MESSAGES.JOB.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (job.status !== 'pending_verification') {
      throw new AppError(ERROR_MESSAGES.JOB.INVALID_STATUS, HttpStatus.BAD_REQUEST);
    }

    await this._jobRepository.rejectJob(jobId, rejectedReason);

    const updatedJob = await this._jobRepository.getJobById(jobId);
    if (!updatedJob) {
      throw new AppError(ERROR_MESSAGES.JOB.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const clientIdStr = (updatedJob.clientId as any)._id?.toString() || updatedJob.clientId.toString();

    await this._notificationService.createAndEmitNotification(clientIdStr, {
      role: 'client',
      title: 'Job Rejected',
      message: `Your job "${updatedJob.title}" has been rejected. Reason: ${rejectedReason}`,
      type: 'job',
      relatedId: jobId,
    });

    const updatedJobDto: AdminJobDetailResponseDTO =
      mapJobModelToAdminJobDetailResponseDTO(updatedJob);

    return updatedJobDto;
  }

  async suspendJob(jobId: string, suspendedReason: string): Promise<AdminJobDetailResponseDTO> {
    const job = await this._jobRepository.getJobById(jobId);
    if (!job) {
      throw new AppError(ERROR_MESSAGES.JOB.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (job.status !== 'open') {
      throw new AppError(ERROR_MESSAGES.JOB.INVALID_STATUS, HttpStatus.BAD_REQUEST);
    }

    await this._jobRepository.suspendJob(jobId, suspendedReason);

    const updatedJob = await this._jobRepository.getJobById(jobId);
    if (!updatedJob) {
      throw new AppError(ERROR_MESSAGES.JOB.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const updatedJobDto: AdminJobDetailResponseDTO =
      mapJobModelToAdminJobDetailResponseDTO(updatedJob);

    return updatedJobDto;
  }

  async getJobStats(): Promise<{ activeJobs: number; rejectedJobs: number; pendingJobs: number }> {
    const activeJobs = await this._jobRepository.countJobsByStatus('open');
    const rejectedJobs = await this._jobRepository.countJobsByStatus('rejected');
    const pendingJobs = await this._jobRepository.countJobsByStatus('pending_verification');

    return {
      activeJobs,
      rejectedJobs,
      pendingJobs,
    };
  }
}
