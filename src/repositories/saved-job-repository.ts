import BaseRepository from './baseRepositories/base-repository';
import SavedJob from '../models/saved-job.model';
import { ISavedJob } from '../models/interfaces/saved-job.model.interface';
import {
  ISavedJobRepository,
  SavedJobWithJobAggregation,
} from './interfaces/saved-job-repository.interface';
import { PipelineStage, Types } from 'mongoose';

export class SavedJobRepository extends BaseRepository<ISavedJob> implements ISavedJobRepository {
  constructor() {
    super(SavedJob);
  }

  async findByFreelancerAndJob(freelancerId: string, jobId: string): Promise<ISavedJob | null> {
    return await this.model.findOne({ freelancerId, jobId }).exec();
  }

  async deleteByFreelancerAndJob(freelancerId: string, jobId: string): Promise<ISavedJob | null> {
    return await this.model.findOneAndDelete({ freelancerId, jobId }).exec();
  }

  async findAllByFreelancer(freelancerId: string): Promise<ISavedJob[]> {
    return await this.model.find({ freelancerId }).exec();
  }

  async findWithJobDetails(
    freelancerId: string,
    page: number,
    limit: number,
  ): Promise<SavedJobWithJobAggregation[]> {
    const skip = (page - 1) * limit;
    const pipeline: PipelineStage[] = [
      {
        $match: { freelancerId: new Types.ObjectId(freelancerId) },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job',
        },
      },
      { $unwind: { path: '$job', preserveNullAndEmptyArrays: true } },
      // Lookup category
      {
        $lookup: {
          from: 'categories',
          localField: 'job.category',
          foreignField: '_id',
          as: 'categoryDoc',
        },
      },
      { $unwind: { path: '$categoryDoc', preserveNullAndEmptyArrays: true } },
      // Convert specialities and skills (stored as strings) to ObjectIds for lookup
      {
        $addFields: {
          jobSpecialityIds: {
            $map: {
              input: '$job.specialities',
              as: 'sid',
              in: { $toObjectId: '$$sid' },
            },
          },
          jobSkillIds: {
            $map: {
              input: '$job.skills',
              as: 'kid',
              in: { $toObjectId: '$$kid' },
            },
          },
        },
      },
      // Lookup specialities
      {
        $lookup: {
          from: 'specialities',
          localField: 'jobSpecialityIds',
          foreignField: '_id',
          as: 'specialitiesDocs',
        },
      },
      // Lookup skills
      {
        $lookup: {
          from: 'skills',
          localField: 'jobSkillIds',
          foreignField: '_id',
          as: 'skillsDocs',
        },
      },
      // Lookup client minimal
      {
        $lookup: {
          from: 'users',
          localField: 'job.clientId',
          foreignField: '_id',
          as: 'clientDoc',
        },
      },
      { $unwind: { path: '$clientDoc', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          savedAt: '$createdAt',
          job: {
            _id: '$job._id',
            title: '$job.title',
            description: '$job.description',
            category: {
              _id: '$categoryDoc._id',
              name: '$categoryDoc.name',
            },
            specialities: {
              $map: {
                input: '$specialitiesDocs',
                as: 's',
                in: { _id: '$$s._id', name: '$$s.name' },
              },
            },
            skills: {
              $map: { input: '$skillsDocs', as: 'k', in: { _id: '$$k._id', name: '$$k.name' } },
            },
            rateType: '$job.rateType',
            hourlyRate: '$job.hourlyRate',
            fixedRate: '$job.fixedRate',
            client: {
              companyName: '$clientDoc.clientProfile.companyName',
              country: '$clientDoc.address.country',
            },
            status: '$job.status',
            createdAt: '$job.createdAt',
          },
        },
      },
    ];

    const results = await this.model.aggregate<SavedJobWithJobAggregation>(pipeline).exec();
    return results;
  }

  async countByFreelancer(freelancerId: string): Promise<number> {
    return await this.model.countDocuments({ freelancerId }).exec();
  }
}

export default SavedJobRepository;
