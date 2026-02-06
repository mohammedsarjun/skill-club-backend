import {
  JobReportsResponseDTO,
  PaginatedAdminReportedJobDTO,
} from '../../../dto/adminDTO/admin-reported-job.dto';

export interface IAdminReportedJobService {
  getAllReportedJobs(page: number, limit: number): Promise<PaginatedAdminReportedJobDTO>;
  getReportsByJobId(jobId: string): Promise<JobReportsResponseDTO>;
}
