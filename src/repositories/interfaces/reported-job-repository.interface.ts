import BaseRepository from '../baseRepositories/base-repository';
import {
  IHighReportedJob,
  IReportedJob,
} from '../../models/interfaces/reported-job.model.interface';

export interface IReportedJobRepository extends BaseRepository<IReportedJob> {
  findByFreelancerAndJob(freelancerId: string, jobId: string): Promise<IReportedJob | null>;
  deleteByFreelancerAndJob(freelancerId: string, jobId: string): Promise<IReportedJob | null>;
  countByFreelancer(freelancerId: string): Promise<number>;
  findByJobId(jobId: string): Promise<IReportedJob[]>;
  getAllReported(skip: number, limit: number): Promise<IReportedJob[]>;
  countAllReported(): Promise<number>;
  getHighReportedJobs(): Promise<IHighReportedJob[]>;
  countByJobId(jobId: string): Promise<number>;
}

export default IReportedJobRepository;
