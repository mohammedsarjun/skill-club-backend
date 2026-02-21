import ContractActivity from '../models/contract-activity';
import BaseRepository from './baseRepositories/base-repository';
import { IContractActivityRepository } from './interfaces/contract-activity-repository.interface';
import { IContractActivity } from '../models/interfaces/contract-activity.interface';
import { ClientSession, Types } from 'mongoose';

export class ContractActivityRepository
  extends BaseRepository<IContractActivity>
  implements IContractActivityRepository
{
  constructor() {
    super(ContractActivity);
  }

  async createActivity(
    activityData: Partial<IContractActivity>,
    session?: ClientSession,
  ): Promise<IContractActivity> {
    return await super.create(activityData, session);
  }

  async getContractActivities(contractId: string): Promise<IContractActivity[]> {
    return await super.findAll(
      { contractId: new Types.ObjectId(contractId) },
      {
        populate: [{ path: 'actor.userId', select: 'firstName lastName' }],
      },
    );
  }

  async getActivitiesByContract(contractId: Types.ObjectId): Promise<IContractActivity[]> {
    return await this.model
      .find({ contractId })
      .populate('actor.userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }
}
