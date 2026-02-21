import { IHighReportedJob } from 'src/models/interfaces/reported-job.model.interface';
import {
  JobReportsResponseDTO,
  PaginatedAdminReportedJobDTO,
} from '../../../dto/adminDTO/admin-reported-job.dto';

export interface IAdminReportedJobService {
  getAllReportedJobs(page: number, limit: number): Promise<PaginatedAdminReportedJobDTO>;
  getReportsByJobId(jobId: string): Promise<JobReportsResponseDTO>;
  getHighReportedJobs(): Promise<IHighReportedJob[]>;
}
