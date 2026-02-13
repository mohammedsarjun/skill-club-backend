import { injectable, inject } from 'tsyringe';
import { IAdminReportedJobService } from './interfaces/admin-reported-job-service.interface';
import { IReportedJobRepository } from '../../repositories/interfaces/reported-job-repository.interface';
import {
  JobReportsResponseDTO,
  PaginatedAdminReportedJobDTO,
} from '../../dto/adminDTO/admin-reported-job.dto';
import { mapReportedJobToAdminDTO } from '../../mapper/adminMapper/admin-reported-job.mapper';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { IHighReportedJob } from 'src/models/interfaces/reported-job.model.interface';

@injectable()
export class AdminReportedJobService implements IAdminReportedJobService {
  private _reportedJobRepository: IReportedJobRepository;

  constructor(
    @inject('IReportedJobRepository')
    reportedJobRepository: IReportedJobRepository,
  ) {
    this._reportedJobRepository = reportedJobRepository;
  }

  async getAllReportedJobs(page: number, limit: number): Promise<PaginatedAdminReportedJobDTO> {
    const skip = (page - 1) * limit;

    const reports = await this._reportedJobRepository.getAllReported(skip, limit);
    const total = await this._reportedJobRepository.countAllReported();

    const reportsDTO = reports.map(mapReportedJobToAdminDTO);

    return {
      data: reportsDTO,
      total,
      page,
      limit,
    };
  }

  async getReportsByJobId(jobId: string): Promise<JobReportsResponseDTO> {
    const reports = await this._reportedJobRepository.findByJobId(jobId);

    if (!reports) {
      throw new AppError(ERROR_MESSAGES.REPORT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const reportsDTO = reports.map(mapReportedJobToAdminDTO);

    return {
      reports: reportsDTO,
      totalReports: reports.length,
    };
  }

  async getHighReportedJobs(): Promise<IHighReportedJob[]>{
    return await this._reportedJobRepository.getHighReportedJobs()
  }
}
