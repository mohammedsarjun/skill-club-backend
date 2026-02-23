import { User } from '../models/user.model';
import {
  IExperience,
  IFreelancerData,
  IFreelancerDetailData,
  IUser,
} from '../models/interfaces/user.model.interface';
import BaseRepository from './baseRepositories/base-repository';
import { IFreelancerRepository } from './interfaces/freelancer-repository.interface';
import { IEducationDTO, UpdateLanguageDTO } from '../dto/freelancer.dto';
import { Types } from 'mongoose';
import { freelancerParams } from '../dto/clientDTO/client-freelancer.dto';
import { mapClientQueryToFreelancerModelQuery } from '../mapper/clientMapper/client-freelancer.mapper';

export class FreelancerRepository extends BaseRepository<IUser> implements IFreelancerRepository {
  constructor() {
    super(User);
  }

  async getFreelancerById(userId: string): Promise<
    | (Omit<
        IUser,
        | 'freelancerProfile.workCategory'
        | 'freelancerProfile.specialties'
        | 'freelancerProfile.skills'
      > & {
        freelancerProfile: {
          workCategory: { _id: string; name: string };
          specialties: { _id: string; name: string }[];
          skills: { _id: string; name: string }[];
        };
      })
    | null
  > {
    const freelancer = await this.findOne(
      { _id: userId, roles: 'freelancer' },
      {
        populate: [
          { path: 'freelancerProfile.workCategory', select: '_id name' },
          { path: 'freelancerProfile.specialties', select: '_id name' },
          { path: 'freelancerProfile.skills', select: '_id name' },
        ],
      },
    );

    return freelancer as
      | (Omit<
          IUser,
          | 'freelancerProfile.workCategory'
          | 'freelancerProfile.specialties'
          | 'freelancerProfile.skills'
        > & {
          freelancerProfile: {
            workCategory: { _id: string; name: string };
            specialties: { _id: string; name: string }[];
            skills: { _id: string; name: string }[];
          };
        })
      | null;
  }

  async updateFreelancerName(userId: string, name: string): Promise<IUser | null> {
    const [firstName, ...lastNameParts] = name.trim().split(' ');
    const lastName = lastNameParts.join(' ');
    return this.updateById(userId, { firstName, lastName });
  }

  async addLanguageToFreelancerProfile(
    userId: string,
    language: UpdateLanguageDTO,
  ): Promise<IUser | null> {
    return this.updateById(userId, { $push: { 'freelancerProfile.languages': language } });
  }

  async deleteLanguageFromFreelancerProfile(
    userId: string,
    language: string,
  ): Promise<IUser | null> {
    return this.updateById(userId, {
      $pull: { 'freelancerProfile.languages': { name: language } },
    });
  }

  async updateFreelancerProfile(
    userId: string,
    data: Record<string, unknown>,
  ): Promise<IUser | null> {
    return this.updateById(userId, data);
  }

  async addEducationToFreelancerProfile(
    userId: string,
    education: IEducationDTO,
  ): Promise<IUser | null> {
    return super.updateById(userId, {
      $push: { 'freelancerProfile.education': education },
    });
  }

  async deleteEducationFromFreelancerProfile(
    userId: string,
    educationId: string,
  ): Promise<IUser | null> {
    return super.updateById(userId, {
      $pull: { 'freelancerProfile.education': { _id: new Types.ObjectId(educationId) } },
    });
  }

  async addWorkExperienceToFreelancerProfile(
    userId: string,
    workHistory: IExperience,
  ): Promise<IUser | null> {
    return super.updateById(userId, {
      $push: { 'freelancerProfile.experiences': workHistory },
    });
  }

  async deleteWorkExperienceFromFreelancerProfile(
    userId: string,
    workHistoryId: string,
  ): Promise<IUser | null> {
    return super.updateById(userId, {
      $pull: { 'freelancerProfile.experiences': { _id: new Types.ObjectId(workHistoryId) } },
    });
  }

  async updateFreelancerExpertise(
    userId: string,
    category: string,
    specialities: string[],
    skills: string[],
  ): Promise<IUser | null> {
    return super.updateById(userId, {
      'freelancerProfile.workCategory': new Types.ObjectId(category),
      'freelancerProfile.specialties': specialities.map((id) => new Types.ObjectId(id)),
      'freelancerProfile.skills': skills.map((id) => new Types.ObjectId(id)),
    });
  }

  async getAllFreelancers(
    clientUserId: string,
    queryFilter: freelancerParams,
  ): Promise<IFreelancerData[] | null> {
    const mongoQuery = mapClientQueryToFreelancerModelQuery(clientUserId, queryFilter);

    const page = Number(queryFilter.page) || 1;
    const limit = Number(queryFilter.limit) || 10;
    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $addFields: {
          'freelancerProfile.skills': {
            $cond: {
              if: { $isArray: '$freelancerProfile.skills' },
              then: {
                $map: {
                  input: '$freelancerProfile.skills',
                  as: 'skillId',
                  in: { $toObjectId: '$$skillId' },
                },
              },
              else: [],
            },
          },
          'freelancerProfile.specialties': {
            $cond: {
              if: { $isArray: '$freelancerProfile.specialties' },
              then: {
                $map: {
                  input: '$freelancerProfile.specialties',
                  as: 'specId',
                  in: { $toObjectId: '$$specId' },
                },
              },
              else: [],
            },
          },
          'freelancerProfile.workCategory': {
            $cond: {
              if: { $gt: ['$freelancerProfile.workCategory', null] },
              then: { $toObjectId: '$freelancerProfile.workCategory' },
              else: null,
            },
          },
        },
      },
      { $match: mongoQuery },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'skills',
          localField: 'freelancerProfile.skills',
          foreignField: '_id',
          as: 'freelancerProfile.skills',
        },
      },
      {
        $lookup: {
          from: 'contracts',
          localField: '_id',
          foreignField: 'freelancerId',
          as: 'contracts',
        },
      },
      {
        $lookup: {
          from: 'contracttransactions',
          let: { freelancerId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$freelancerId', '$$freelancerId'] },
                    { $eq: ['$purpose', 'release'] },
                    { $eq: ['$status', 'completed'] },
                  ],
                },
              },
            },
          ],
          as: 'releasedTransactions',
        },
      },
      {
        $addFields: {
          totalContracts: { $size: '$contracts' },
          completedContracts: {
            $size: {
              $filter: {
                input: '$contracts',
                as: 'contract',
                cond: { $eq: ['$$contract.status', 'completed'] },
              },
            },
          },
          totalEarnedAmount: {
            $sum: '$releasedTransactions.amount',
          },
        },
      },
      {
        $addFields: {
          jobSuccessRate: {
            $cond: {
              if: { $eq: ['$totalContracts', 0] },
              then: 0,
              else: {
                $multiply: [{ $divide: ['$completedContracts', '$totalContracts'] }, 100],
              },
            },
          },
        },
      },
      ...(queryFilter.jobSuccessRate && Number(queryFilter.jobSuccessRate) > 0
        ? [{ $match: { jobSuccessRate: { $gte: Number(queryFilter.jobSuccessRate) } } }]
        : []),
      {
        $project: {
          freelancerId: { $toString: '$_id' },
          logo: '$freelancerProfile.logo',
          firstName: '$firstName',
          lastName: '$lastName',
          professionalRole: '$freelancerProfile.professionalRole',
          country: '$address.country',
          hourlyRate: '$freelancerProfile.hourlyRate',
          jobSuccessRate: { $round: ['$jobSuccessRate', 0] },
          totalEarnedAmount: '$totalEarnedAmount',
          hourlyRateCurrency: '$freelancerProfile.hourlyRateCurrency',
          categoryId: {
            $cond: {
              if: { $gt: ['$freelancerProfile.workCategory', null] },
              then: { $toString: '$freelancerProfile.workCategory' },
              else: '',
            },
          },
          specialityIds: {
            $map: {
              input: { $ifNull: ['$freelancerProfile.specialties', []] },
              as: 's',
              in: { $toString: '$$s' },
            },
          },
          skills: {
            $map: {
              input: { $ifNull: ['$freelancerProfile.skills', []] },
              as: 's',
              in: '$$s.name',
            },
          },
          bio: '$freelancerProfile.bio',
          language: {
            $map: {
              input: { $ifNull: ['$freelancerProfile.languages', []] },
              as: 'l',
              in: '$$l.name',
            },
          },
        },
      },
    ];

    const result = await this.model.aggregate(pipeline).exec();

    return result as IFreelancerData[];
  }

  async getFreelacerByIdForClient(freelancerId: string): Promise<IFreelancerDetailData | null> {
    const [freelancer] = await this.model.aggregate([
      { $match: { _id: new Types.ObjectId(freelancerId) } },
      {
        $lookup: {
          from: 'specialities',
          localField: 'freelancerProfile.specialties',
          foreignField: '_id',
          as: 'specialtiesData',
        },
      },
      {
        $lookup: {
          from: 'skills',
          localField: 'freelancerProfile.skills',
          foreignField: '_id',
          as: 'skillsData',
        },
      },
      {
        $lookup: {
          from: 'contracts',
          localField: '_id',
          foreignField: 'freelancerId',
          as: 'contracts',
        },
      },
      {
        $lookup: {
          from: 'contracttransactions',
          let: { freelancerId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$freelancerId', '$$freelancerId'] },
                    { $eq: ['$purpose', 'release'] },
                    { $eq: ['$status', 'completed'] },
                  ],
                },
              },
            },
          ],
          as: 'releasedTransactions',
        },
      },
      {
        $addFields: {
          totalContracts: { $size: '$contracts' },
          completedContracts: {
            $size: {
              $filter: {
                input: '$contracts',
                as: 'contract',
                cond: { $eq: ['$$contract.status', 'completed'] },
              },
            },
          },
          totalEarnedAmount: {
            $sum: '$releasedTransactions.amount',
          },
        },
      },
      {
        $addFields: {
          jobSuccessRate: {
            $cond: {
              if: { $eq: ['$totalContracts', 0] },
              then: 0,
              else: {
                $multiply: [{ $divide: ['$completedContracts', '$totalContracts'] }, 100],
              },
            },
          },
        },
      },
      {
        $project: {
          firstName: '$firstName',
          lastName: '$lastName',
          address: '$address',
          logo: '$freelancerProfile.logo',
          workCategory: '$freelancerProfile.workCategory',
          hourlyRateCurrency: '$freelancerProfile.hourlyRateCurrency',
          specialties: {
            $map: {
              input: { $ifNull: ['$specialtiesData', []] },
              as: 'spec',
              in: { id: '$$spec._id', name: '$$spec.name' },
            },
          },
          skills: {
            $map: {
              input: { $ifNull: ['$skillsData', []] },
              as: 'sk',
              in: { id: '$$sk._id', name: '$$sk.name' },
            },
          },
          professionalRole: '$freelancerProfile.professionalRole',
          experiences: '$freelancerProfile.experiences',
          education: '$freelancerProfile.education',
          languages: '$freelancerProfile.languages',
          bio: '$freelancerProfile.bio',
          hourlyRate: '$freelancerProfile.hourlyRate',
          jobSuccessRate: { $round: ['$jobSuccessRate', 0] },
          totalEarnedAmount: '$totalEarnedAmount',
        },
      },
    ]);

    return freelancer as unknown as IFreelancerDetailData;
  }

  async countAllFreelancers(): Promise<number> {
    return await this.count();
  }

  async countFilteredFreelancers(clientUserId: string, queryFilter: freelancerParams): Promise<number> {
    const mongoQuery = mapClientQueryToFreelancerModelQuery(clientUserId, queryFilter);
    return await this.count(mongoQuery);
  }
}
