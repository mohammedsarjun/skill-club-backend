import { UserActionVerificationModel } from '../models/action-verification.model';
import { IUserActionVerification } from '../models/interfaces/action-verification.model.interface';
import BaseRepository from './baseRepositories/base-repository';
import { IActionVerificationRepository } from './interfaces/action-verification-repository.interface';
import { CreateActionVerificationDto, RequestChangeEmailDto } from '../dto/action-verification.dto';

export class ActionVerificationRepository
  extends BaseRepository<IUserActionVerification>
  implements IActionVerificationRepository
{
  constructor() {
    super(UserActionVerificationModel);
  }

  async createActionVerificaion(
    data: CreateActionVerificationDto,
  ): Promise<IUserActionVerification | null> {
    const { userId, actionType, actionData } = data;
    return super.create({ userId, actionType, actionData });
  }

  async saveEmailChangeRequest(
    data: RequestChangeEmailDto,
  ): Promise<IUserActionVerification | null> {
    const { userId, actionType, actionData, status, passwordVerified, otpSent } = data;
    return super.create({ userId, actionType, actionData, status, passwordVerified, otpSent });
  }

  async findOneByUserId(userId: string): Promise<IUserActionVerification | null> {
    return super.findOne({ userId, status: 'pending' });
  }

  async changeActionVerificationStatus(
    userId: string,
    status: 'pending' | 'completed' | 'expired' | 'failed',
  ): Promise<IUserActionVerification | null> {
    return super.update({ userId, status: 'pending' }, { $set: { status } });
  }
}
