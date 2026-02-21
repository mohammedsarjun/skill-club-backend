import { injectable, inject } from 'tsyringe';
import { IContractActivityService } from './interfaces/contract-activity-service.interface';
import { IContractActivityRepository } from '../../repositories/interfaces/contract-activity-repository.interface';
import { IContractRepository } from '../../repositories/interfaces/contract-repository.interface';
import { ContractTimelineDTO } from '../../dto/commonDTO/contract-activity.dto';
import { mapContractActivityToDTO } from '../../mapper/commonMapper/contract-activity.mapper';
import { Types, ClientSession } from 'mongoose';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { ContractEventType } from 'src/models/interfaces/contract-activity.interface';

@injectable()
export class ContractActivityService implements IContractActivityService {
  constructor(
    @inject('IContractActivityRepository')
    private _contractActivityRepository: IContractActivityRepository,
    @inject('IContractRepository')
    private _contractRepository: IContractRepository,
  ) {}

  async logActivity(
    contractId: Types.ObjectId,
    eventType: string,
    role: 'client' | 'freelancer' | 'system' | 'admin',
    userId: Types.ObjectId | undefined,
    title: string,
    description: string,
    metadata?: {
      amount?: number;
      milestoneId?: Types.ObjectId;
      messageId?: Types.ObjectId;
      reason?: string;
    },
    session?: ClientSession,
  ): Promise<void> {
    await this._contractActivityRepository.createActivity(
      {
        contractId,
        actor: {
          role,
          userId,
        },
        eventType: eventType as ContractEventType | undefined,
        title,
        description,
        metadata,
      },
      session,
    );
  }

  async getContractTimeline(
    contractId: string,
    userId: string,
    role: 'client' | 'freelancer',
  ): Promise<ContractTimelineDTO> {
    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contract ID', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(contractId);
    if (!contract) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (role === 'client' && contract.clientId.toString() !== userId) {
      throw new AppError('Unauthorized access to contract', HttpStatus.FORBIDDEN);
    }

    if (role === 'freelancer' && contract.freelancerId.toString() !== userId) {
      throw new AppError('Unauthorized access to contract', HttpStatus.FORBIDDEN);
    }

    const activities = await this._contractActivityRepository.getContractActivities(contractId);

    return {
      activities: activities.map(mapContractActivityToDTO),
      total: activities.length,
    };
  }

  async getAdminContractTimeline(contractId: string): Promise<ContractTimelineDTO> {
    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contract ID', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(contractId);
    if (!contract) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const activities = await this._contractActivityRepository.getContractActivities(contractId);

    return {
      activities: activities.map(mapContractActivityToDTO),
      total: activities.length,
    };
  }
}
