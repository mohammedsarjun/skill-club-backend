import BaseRepository from './baseRepositories/base-repository';
import ReportedJob from '../models/reported-job.model';
import { IHighReportedJob, IReportedJob } from '../models/interfaces/reported-job.model.interface';
import { IReportedJobRepository } from './interfaces/reported-job-repository.interface';

export class ReportedJobRepository
  extends BaseRepository<IReportedJob>
  implements IReportedJobRepository
{
  constructor() {
    super(ReportedJob);
  }

  async findByFreelancerAndJob(freelancerId: string, jobId: string): Promise<IReportedJob | null> {
    return await this.model.findOne({ freelancerId, jobId }).exec();
  }

  async deleteByFreelancerAndJob(
    freelancerId: string,
    jobId: string,
  ): Promise<IReportedJob | null> {
    return await this.model.findOneAndDelete({ freelancerId, jobId }).exec();
  }

  async countByFreelancer(freelancerId: string): Promise<number> {
    return await this.model.countDocuments({ freelancerId }).exec();
  }

  async findByJobId(jobId: string): Promise<IReportedJob[]> {
    return await this.model
      .find({ jobId })
      .populate('freelancerId', 'firstName lastName email profilePicture')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAllReported(skip: number, limit: number): Promise<IReportedJob[]> {
    return await this.model
      .find()
      .populate('freelancerId', 'firstName lastName email profilePicture')
      .populate('jobId', 'title status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countAllReported(): Promise<number> {
    return await this.model.countDocuments().exec();
  }

  async getHighReportedJobs(): Promise<IHighReportedJob[]> {
    return await this.model.aggregate([
      {
        $group: {
          _id: '$jobId',
          totalReportCount: { $sum: 1 },
        },
      },
      {
        $match: {
          totalReportCount: { $gte: 20 },
        },
      },
    ]);
  }
}

export default ReportedJobRepository;
