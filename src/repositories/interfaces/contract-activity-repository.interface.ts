import { IContractActivity } from '../../models/interfaces/contract-activity.interface';
import { ClientSession, Types } from 'mongoose';

export interface IContractActivityRepository {
  createActivity(activityData: Partial<IContractActivity>, session?: ClientSession): Promise<IContractActivity>;
  getContractActivities(contractId: string): Promise<IContractActivity[]>;
  getActivitiesByContract(contractId: Types.ObjectId): Promise<IContractActivity[]>;
}
