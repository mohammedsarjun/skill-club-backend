import BaseRepository from './baseRepositories/base-repository';
import SavedFreelancer from '../models/saved-freelancer.model';
import { ISavedFreelancer } from '../models/interfaces/saved-freelancer.model.interface';
import { ISavedFreelancerRepository } from './interfaces/saved-freelancer-repository.interface';
import { PipelineStage, Types } from 'mongoose';

export class SavedFreelancerRepository
  extends BaseRepository<ISavedFreelancer>
  implements ISavedFreelancerRepository
{
  constructor() {
    super(SavedFreelancer);
  }

  async findByClientAndFreelancer(
    clientId: string,
    freelancerId: string,
  ): Promise<ISavedFreelancer | null> {
    return await this.model.findOne({ clientId, freelancerId }).exec();
  }

  async deleteByClientAndFreelancer(
    clientId: string,
    freelancerId: string,
  ): Promise<ISavedFreelancer | null> {
    return await this.model.findOneAndDelete({ clientId, freelancerId }).exec();
  }

  async findAllByClient(clientId: string): Promise<ISavedFreelancer[]> {
    return await this.model.find({ clientId }).exec();
  }

  async findWithFreelancerDetails(
    clientId: string,
    page: number,
    limit: number,
  ): Promise<
    {
      _id: string;
      savedAt: Date;
      freelancer: {
        _id: string;
        firstName?: string;
        lastName?: string;
        logo?: string;
        professionalRole?: string;
        country?: string;
        hourlyRate?: number;
        skills: string[];
      } | null;
    }[]
  > {
    const skip = (page - 1) * limit;
    const pipeline: PipelineStage[] = [
      { $match: { clientId: new Types.ObjectId(clientId) } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'freelancerId',
          foreignField: '_id',
          as: 'freelancer',
        },
      },
      { $unwind: { path: '$freelancer', preserveNullAndEmptyArrays: true } },
      // Lookup skills names for presentation (optional; keep minimal)
      {
        $addFields: {
          freelancerSkillIds: {
            $map: {
              input: { $ifNull: ['$freelancer.freelancerProfile.skills', []] },
              as: 'sid',
              in: { $toObjectId: '$$sid' },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'skills',
          localField: 'freelancerSkillIds',
          foreignField: '_id',
          as: 'skillsDocs',
        },
      },
      {
        $project: {
          _id: 1,
          savedAt: '$createdAt',
          freelancer: {
            _id: '$freelancer._id',
            firstName: '$freelancer.firstName',
            lastName: '$freelancer.lastName',
            logo: '$freelancer.freelancerProfile.logo',
            professionalRole: '$freelancer.freelancerProfile.professionalRole',
            country: '$freelancer.address.country',
            hourlyRate: '$freelancer.freelancerProfile.hourlyRate',
            skills: {
              $map: { input: '$skillsDocs', as: 'k', in: '$$k.name' },
            },
          },
        },
      },
    ];

    const results = await this.model.aggregate(pipeline).exec();
    return results as unknown as {
      _id: string;
      savedAt: Date;
      freelancer: {
        _id: string;
        firstName?: string;
        lastName?: string;
        logo?: string;
        professionalRole?: string;
        country?: string;
        hourlyRate?: number;
        skills: string[];
      } | null;
    }[];
  }

  async countByClient(clientId: string): Promise<number> {
    return await this.model.countDocuments({ clientId }).exec();
  }
}

export default SavedFreelancerRepository;
