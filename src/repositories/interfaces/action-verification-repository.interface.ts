import { IUserActionVerification } from '../../models/interfaces/action-verification.model.interface';
import BaseRepository from '../baseRepositories/base-repository';
import {
  CreateActionVerificationDto,
  RequestChangeEmailDto,
} from '../../dto/action-verification.dto';

export interface IActionVerificationRepository extends BaseRepository<IUserActionVerification> {
  createActionVerificaion(
    data: CreateActionVerificationDto,
  ): Promise<IUserActionVerification | null>;
  changeActionVerificationStatus(
    userId: string,
    status: 'pending' | 'completed' | 'expired' | 'failed',
  ): Promise<IUserActionVerification | null>;
  saveEmailChangeRequest(data: RequestChangeEmailDto): Promise<IUserActionVerification | null>;
  findOneByUserId(userId: string): Promise<IUserActionVerification | null>;
}
