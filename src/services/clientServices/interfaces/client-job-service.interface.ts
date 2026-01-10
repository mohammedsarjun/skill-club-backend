import { JobQueryParams } from '../../../dto/commonDTO/job-common.dto';
import {
  CreateJobDto,
  ClientJobDetailResponseDTO,
  PaginatedClientJobDto,
} from '../../../dto/clientDTO/client-job.dto';

export interface IClientJobService {
  createJob(clientId: string, jobData: CreateJobDto): Promise<ClientJobDetailResponseDTO>;
  getAllJobs(clientId: string, queryParams: JobQueryParams): Promise<PaginatedClientJobDto>;
  getJobDetail(clientId: string, jobId: string): Promise<ClientJobDetailResponseDTO>;
  updateJobDetail(
    clientId: string,
    jobId: string,
    jobData: Partial<CreateJobDto>,
  ): Promise<ClientJobDetailResponseDTO>;
  closeJob(clientId: string, jobId: string): Promise<void>;
}
