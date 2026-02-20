import { injectable, inject } from 'tsyringe';
import mongoose from 'mongoose';
import '../../config/container';
import IFreelancerReportedJobService from './interfaces/freelancer-reported-job-service.interface';
import { IReportedJobRepository } from '../../repositories/interfaces/reported-job-repository.interface';
import { IJobRepository } from '../../repositories/interfaces/job-repository.interface';
import {
  ReportJobDTO,
  ReportJobResponseDTO,
} from '../../dto/freelancerDTO/freelancer-reported-job.dto';
import { mapToReportJobResponseDTO } from '../../mapper/freelancerMapper/freelancer-reported-job.mapper';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { ERROR_MESSAGES } from '../../contants/error-constants';

@injectable()
export class FreelancerReportedJobService implements IFreelancerReportedJobService {
  private _reportedJobRepository: IReportedJobRepository;
  private _jobRepository: IJobRepository;

  constructor(
    @inject('IReportedJobRepository') reportedJobRepository: IReportedJobRepository,
    @inject('IJobRepository') jobRepository: IJobRepository,
  ) {
    this._reportedJobRepository = reportedJobRepository;
    this._jobRepository = jobRepository;
  }

  async reportJob(
    freelancerId: string,
    jobId: string,
    data: ReportJobDTO,
  ): Promise<ReportJobResponseDTO> {
    const job = await this._jobRepository.findById(jobId);
    if (!job) {
      throw new AppError(ERROR_MESSAGES.JOB.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const existing = await this._reportedJobRepository.findByFreelancerAndJob(freelancerId, jobId);
    if (existing) {
      throw new AppError(ERROR_MESSAGES.JOB.ALREADY_REPORTED, HttpStatus.BAD_REQUEST);
    }

    const jobTotalReportCount = await this._reportedJobRepository.countByJobId(jobId);

    await this._reportedJobRepository.create({
      freelancerId: new mongoose.Types.ObjectId(freelancerId),
      jobId: new mongoose.Types.ObjectId(jobId),
      reason: data.reason,
    });

    if (jobTotalReportCount >= 20) {
      await this._jobRepository.suspendJob(
        jobId,
        'The job has been suspended due to receiving a high number of reports.',
      );
    }

    return mapToReportJobResponseDTO(true);
  }

  async isJobReported(freelancerId: string, jobId: string): Promise<boolean> {
    const existing = await this._reportedJobRepository.findByFreelancerAndJob(freelancerId, jobId);
    return !!existing;
  }
}

export default FreelancerReportedJobService;
