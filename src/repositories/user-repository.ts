import { User } from '../models/user.model';
import { IUser } from '../models/interfaces/user.model.interface';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import BaseRepository from './baseRepositories/base-repository';
import { IUserRepository } from './interfaces/user-repository.interface';
import { AddressDTO } from '../dto/user.dto';

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(User);
  }

  // Find user by email
  async findByEmail(email: string): Promise<IUser | null> {
    return await this.model.findOne({ email });
  }

  async findById(id: string): Promise<IUser | null> {
    return await super.findById(id);
  }

  async updateResetPassword(
    userId: string | Types.ObjectId,
    token: string,
    expiry: Date,
  ): Promise<IUser | null> {
    return await this.model.findByIdAndUpdate(
      userId,
      {
        $set: {
          resetPasswordToken: token,
          resetPasswordExpires: expiry,
        },
      },
      { new: true },
    );
  }

  async updatePassword(
    userId: string | Types.ObjectId,
    hashedPassword: string,
  ): Promise<IUser | null> {
    return await this.model.findByIdAndUpdate(
      userId,
      {
        $set: {
          password: hashedPassword,
        },
        $unset: {
          resetPasswordToken: '',
          resetPasswordExpires: '',
        },
      },
      { new: true },
    );
  }

  async findByResetToken(token: string) {
    return await this.model.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
  }

  async addRoleAndCompleteOnboarding(userId: string | Types.ObjectId, role: string) {
    const update: UpdateQuery<IUser> = {
      $addToSet: { roles: role },
      $set: { activeRole: role, isOnboardingCompleted: true },
    };

    // Set role-specific onboarding flag
    if (role === 'freelancer') {
      update.$set.isFreelancerOnboarded = true;
    } else if (role === 'client') {
      update.$set.isClientOnboarded = true;
    }

    return await this.model.findByIdAndUpdate(userId, update, { new: true });
  }

  async getUsers(
    filters: { name?: string; role?: 'client' | 'freelancer' },
    options: {
      skip: number;
      limit: number;
      populate?: { path: string; select: string };
    },
  ): Promise<IUser[] | null> {
    const query: FilterQuery<IUser> = {};

    if (typeof filters?.name === 'string' && filters.name.trim() !== '') {
      query.firstName = { $regex: filters.name.trim(), $options: 'i' };
    }

    if (typeof filters?.role === 'string' && filters.role.trim() !== '') {
      query.roles = { $in: [filters.role.trim()] };
    }

    let q = this.model.find(query).skip(options.skip).limit(options.limit);

    if (options.populate?.path) {
      q = q.populate(options.populate.path, options.populate.select ?? '');
    }

    return await q.exec();
  }

  async updateClientStatus(userId: string, isBlocked: boolean): Promise<IUser | null> {
    return super.updateById(userId, { isClientBlocked: isBlocked });
  }

  async updateFreelancerStatus(userId: string, isBlocked: boolean): Promise<IUser | null> {
    return super.updateById(userId, { isFreelancerBlocked: isBlocked });
  }

  async createFreelancerProfile(
    userId: string,
    freelancerData: Partial<IUser>,
  ): Promise<IUser | null> {
    return super.updateById(userId, freelancerData);
  }

  async updateUserProfile(userId: string, profileData: Partial<IUser>): Promise<IUser | null> {
    return super.updateById(userId, profileData);
  }

  async updateEmail(userId: string, newEmail: string): Promise<IUser | null> {
    return super.updateById(userId, { email: newEmail });
  }

  async updateUserAddress(userId: string, userAddress: AddressDTO): Promise<IUser | null> {
    return super.updateById(userId, { $set: { address: userAddress } });
  }

  async countAllUsers(): Promise<number> {
    return super.count();
  }

  async updateWalletBalance(userId: string, amount: number): Promise<IUser | null> {
    return await this.model.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: amount } },
      { new: true }
    ).exec();
  }

  async getUserGrowthByPeriod(
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'month' | 'year',
  ): Promise<{ date: Date; freelancers: number; clients: number }[]> {
    const dateFormat =
      groupBy === 'day'
        ? { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        : groupBy === 'month'
          ? { $dateToString: { format: '%Y-%m', date: '$createdAt' } }
          : { $dateToString: { format: '%Y', date: '$createdAt' } };

    const result = await this.model.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          roles: { $in: ['freelancer', 'client'] },
        },
      },
      {
        $project: {
          date: dateFormat,
          isFreelancer: { $in: ['freelancer', '$roles'] },
          isClient: { $in: ['client', '$roles'] },
        },
      },
      {
        $group: {
          _id: '$date',
          freelancers: { $sum: { $cond: ['$isFreelancer', 1, 0] } },
          clients: { $sum: { $cond: ['$isClient', 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return result.map((item) => ({
      date: new Date(item._id),
      freelancers: item.freelancers,
      clients: item.clients,
    }));
  }
}
