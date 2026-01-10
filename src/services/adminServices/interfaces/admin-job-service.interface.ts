import {
  AdminJobDetailResponseDTO,
  PaginatedAdminJobDto,
} from '../../../dto/adminDTO/admin-job.dto';
import { JobQueryParams } from '../../../dto/commonDTO/job-common.dto';

export interface IAdminJobService {
  getAllJobs(queryParams: JobQueryParams): Promise<PaginatedAdminJobDto>;
  getJobDetail(jobId: string): Promise<AdminJobDetailResponseDTO>;
  approveJob(jobId: string): Promise<AdminJobDetailResponseDTO>;
  rejectJob(jobId: string, rejectedReason: string): Promise<AdminJobDetailResponseDTO>;
  suspendJob(jobId: string, suspendedReason: string): Promise<AdminJobDetailResponseDTO>;
  getJobStats(): Promise<{ activeJobs: number; rejectedJobs: number; pendingJobs: number }>;
}
