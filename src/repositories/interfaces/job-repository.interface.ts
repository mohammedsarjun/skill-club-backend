import BaseRepository from '../baseRepositories/base-repository';

import {
  IJob,
  IJobDetail,
  IJobResponse,
  IJobWithCategoryDetail,
  JobData,
} from '../../models/interfaces/job.model.interface';
import { JobQueryParams } from '../../dto/commonDTO/job-common.dto';
import { FreelancerJobFiltersDto } from '../../dto/freelancerDTO/freelancer-job.dto';

export interface IJobRepository extends BaseRepository<IJob> {
  createJob(jobData: Partial<JobData>): Promise<IJob | null>;
  getAllJobs(filters: JobQueryParams, skip: number): Promise<IJobWithCategoryDetail[] | null>;
  getAllJobsByClientId(
    clientId: string,
    filters: JobQueryParams,
    skip: number,
  ): Promise<IJobWithCategoryDetail[]>;
  getJobByClientAndJobId(clientId: string, jobId: string): Promise<IJobDetail | null>;
  updateJobById(jobId: string, jobData: Partial<JobData>): Promise<IJobDetail | null>;
  updateJobStatus(jobId: string, status: string): Promise<IJob | null>;
  rejectJob(jobId: string, rejectedReason: string): Promise<IJob | null>;
  getJobById(jobId: string): Promise<IJobDetail | null>;
  suspendJob(jobId: string, suspendedReason: string): Promise<IJob | null>;
  countAllJobs(): Promise<number>;
  countAllJobsByClientId(clientId: string): Promise<number>;
  findAllWithFreelancerFilters(
    freelancerUserId: string,
    filters: Partial<FreelancerJobFiltersDto>,
    paginationData: { page: number; limit: number },
  ): Promise<IJobResponse[] | null>;
  countActiveJobsByClientId(clientId: string): Promise<number>;
  getRecentJobsByClientId(clientId: string, limit: number): Promise<IJob[]>;
  countActiveJobs(): Promise<number>;
  countJobsByStatus(status: string): Promise<number>;
 
}
