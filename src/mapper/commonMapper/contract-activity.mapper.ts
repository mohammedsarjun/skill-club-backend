import { IContractActivity } from '../../models/interfaces/contract-activity.interface';
import { ContractActivityDTO } from '../../dto/commonDTO/contract-activity.dto';
import { Types } from 'mongoose';

export const mapContractActivityToDTO = (activity: IContractActivity): ContractActivityDTO => {
  const actorUser = activity.actor.userId as unknown as Partial<{
    _id?: Types.ObjectId;
    firstName?: string;
    lastName?: string;
  }>;

  return {
    activityId: (activity._id as Types.ObjectId).toString(),
    contractId: activity.contractId.toString(),
    actor: {
      role: activity.actor.role,
      userId: activity.actor.userId?.toString(),
      name: actorUser?.firstName && actorUser?.lastName
        ? `${actorUser.firstName} ${actorUser.lastName}`
        : undefined,
    },
    eventType: activity.eventType,
    title: activity.title,
    description: activity.description,
    metadata: activity.metadata
      ? {
          amount: activity.metadata.amount,
          milestoneId: activity.metadata.milestoneId?.toString(),
          messageId: activity.metadata.messageId?.toString(),
          reason: activity.metadata.reason,
        }
      : undefined,
    createdAt: activity.createdAt,
  };
};
