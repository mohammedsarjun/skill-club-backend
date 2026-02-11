import BaseRepository from '../baseRepositories/base-repository';
import { IReportedJob } from '../../models/interfaces/reported-job.model.interface';

export interface IReportedJobRepository extends BaseRepository<IReportedJob> {
  findByFreelancerAndJob(freelancerId: string, jobId: string): Promise<IReportedJob | null>;
  deleteByFreelancerAndJob(freelancerId: string, jobId: string): Promise<IReportedJob | null>;
  countByFreelancer(freelancerId: string): Promise<number>;
  findByJobId(jobId: string): Promise<IReportedJob[]>;
  getAllReported(skip: number, limit: number): Promise<IReportedJob[]>;
  countAllReported(): Promise<number>;
}

export default IReportedJobRepository;
