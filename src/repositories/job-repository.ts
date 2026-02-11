import { jobModel } from '../models/job.model';

import BaseRepository from './baseRepositories/base-repository';
import {
  IJob,
  IJobDetail,
  IJobResponse,
  IJobWithCategoryDetail,
  JobData,
} from '../models/interfaces/job.model.interface';
import { IJobRepository } from './interfaces/job-repository.interface';
import { JobQueryParams } from '../dto/commonDTO/job-common.dto';
import { FreelancerJobFiltersDto } from '../dto/freelancerDTO/freelancer-job.dto';
import { PipelineStage, Types } from 'mongoose';
import { mapFreelancerJobFilterDtoToJobAggregationQuery } from '../mapper/freelancerMapper/freelancer-job.mapper';

export class JobRepository extends BaseRepository<IJob> implements IJobRepository {
  constructor() {
    super(jobModel);
  }
  // Creates a new job document in the database
  async createJob(jobData: Partial<JobData>): Promise<IJob | null> {
    return await super.create(jobData);
  }

  async getAllJobs(
    filters: JobQueryParams,
    skip: number,
  ): Promise<IJobWithCategoryDetail[] | null> {
    const query = filters.filters;
    return await super.findAll(
      { title: { $regex: filters.search, $options: 'i' }, ...query },
      {
        skip,
        limit: filters.limit,
        populate: [
          { path: 'category', select: '_id name' },
          { path: 'clientId', select: '_id clientProfile.companyName' },
        ],
      },
    );
  }

  async getAllJobsByClientId(
    clientId: string,
    filters: JobQueryParams,
    skip: number,
  ): Promise<IJobWithCategoryDetail[]> {
    const query = filters.filters;
    return await super.findAll(
      { clientId: clientId, title: { $regex: filters.search, $options: 'i' }, ...query },
      {
        skip,
        limit: filters.limit,
        populate: [
          { path: 'category', select: '_id name' },
          { path: 'clientId', select: '_id clientProfile.companyName' },
        ],
      },
    );
  }

  async getJobByClientAndJobId(clientId: string, jobId: string): Promise<IJobDetail | null> {
    return await super.findOne(
      { _id: jobId, clientId: clientId },
      {
        populate: [
          { path: 'category', select: '_id name' },
          { path: 'clientId', select: '_id clientProfile.companyName clientProfile.logo' },
          { path: 'specialities', select: '_id name' },
          { path: 'skills', select: '_id name' },
        ],
      },
    );
  }

  async getJobById(jobId: string): Promise<IJobDetail | null> {
    return await super.findOne(
      { _id: jobId },
      {
        populate: [
          { path: 'category', select: '_id name' },
          { path: 'clientId', select: '_id clientProfile.companyName clientProfile.logo' },
          { path: 'specialities', select: '_id name' },
          { path: 'skills', select: '_id name' },
        ],
      },
    );
  }

  async updateJobStatus(jobId: string, status: string): Promise<IJob | null> {
    return await super.updateById(jobId, { status });
  }

  async rejectJob(jobId: string, rejectedReason: string): Promise<IJob | null> {
    return await super.updateById(jobId, { status: 'rejected', rejectedReason });
  }

  async suspendJob(jobId: string, suspendedReason: string): Promise<IJob | null> {
    return await super.updateById(jobId, { status: 'suspended', suspendedReason });
  }

  async updateJobById(jobId: string, jobData: Partial<JobData>): Promise<IJobDetail | null> {
    return await super.updateById(jobId, jobData);
  }

  async countAllJobs(): Promise<number> {
    return await super.count();
  }

  async countAllJobsByClientId(clientId: string): Promise<number> {
    return await super.count({ clientId });
  }
  async findAllWithFreelancerFilters(
    freelancerUserId: string,
    filters: FreelancerJobFiltersDto,
    paginationData: { page: number; limit: number },
  ): Promise<IJobResponse[] | null> {
    const pipeline: PipelineStage[] = [];

    // Get match stage from mapper
    const initialMatchStage = mapFreelancerJobFilterDtoToJobAggregationQuery(filters);
    pipeline.push(
      { $match: initialMatchStage },
      { $match: { clientId: { $ne: new Types.ObjectId(freelancerUserId) } } },
    );

    // Lookup client details
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'clientId',
        foreignField: '_id',
        as: 'client',
      },
    });

    pipeline.push({
      $unwind: {
        path: '$client',
        preserveNullAndEmptyArrays: true,
      },
    });

    // Filter by country if provided
    if (filters.selectedCountry) {
      pipeline.push({
        $match: {
          'client.address.country': filters.selectedCountry,
        },
      });
    }

    pipeline.push({
      $lookup: {
        from: 'proposals',
        localField: '_id',
        foreignField: 'jobId',
        as: 'proposals',
      },
    });

    pipeline.push({
      $addFields: {
        proposalCount: { $size: '$proposals' },
      },
    });

    pipeline.push({
      $lookup: {
        from: 'reviews',
        let: { clientId: '$client._id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$revieweeId', '$$clientId'] },
            },
          },
        ],
        as: 'clientReviews',
      },
    });

    pipeline.push({
      $lookup: {
        from: 'contracts',
        let: { clientId: '$client._id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$clientId', '$$clientId'] },
                  { $in: ['$status', ['completed', 'cancelled']] },
                ],
              },
            },
          },
        ],
        as: 'completedContracts',
      },
    });

    pipeline.push({
      $addFields: {
        clientRating: {
          $cond: {
            if: { $gt: [{ $size: '$clientReviews' }, 0] },
            then: { $avg: '$clientReviews.rating' },
            else: 0,
          },
        },
        totalMoneySpent: {
          $sum: '$completedContracts.totalAmount',
        },
      },
    });

    pipeline.push({
      $addFields: {
        specialities: {
          $map: {
            input: '$specialities',
            as: 'specialityId',
            in: { $toObjectId: '$$specialityId' },
          },
        },
      },
    });

    // Lookup specialities details
    pipeline.push({
      $lookup: {
        from: 'specialities',
        localField: 'specialities',
        foreignField: '_id',
        as: 'specialitiesDetails',
      },
    });

    // Lookup skills details

    pipeline.push({
      $addFields: {
        skills: {
          $map: {
            input: '$skills',
            as: 'skillId',
            in: { $toObjectId: '$$skillId' },
          },
        },
      },
    });
    pipeline.push({
      $lookup: {
        from: 'skills',
        localField: 'skills',
        foreignField: '_id',
        as: 'skillsDetails',
      },
    });

    // Sort by creation date (newest first)
    pipeline.push({
      $sort: { createdAt: -1 },
    });

    // Pagination
    const skip = (paginationData.page - 1) * paginationData.limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: paginationData.limit });

    // Project final structure
    pipeline.push({
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        category: 1,
        specialities: '$specialitiesDetails',
        skills: '$skillsDetails',
        currency: 1,
        rateType: 1,
        hourlyRate: 1,
        fixedRate: 1,
        proposalCount: 1,
        client: {
          _id: '$client._id',
          companyName: '$client.clientProfile.companyName',
          country: '$client.address.country',
          rating: '$clientRating',
          totalMoneySpent: '$totalMoneySpent',
        },
        status: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    });

    const results = await this.model.aggregate(pipeline).exec();
    return results.length > 0 ? results : null;
  }

  async countActiveJobsByClientId(clientId: string): Promise<number> {
    return await super.count({ clientId, status: 'open' });
  }

  async getRecentJobsByClientId(clientId: string, limit: number): Promise<IJob[]> {
    const jobs = await this.model
      .find({ clientId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return jobs as IJob[];
  }

  async countActiveJobs(): Promise<number> {
    return await super.count({ status: 'open' });
  }

  async countJobsByStatus(status: string): Promise<number> {
    return await super.count({ status });
  }
}
