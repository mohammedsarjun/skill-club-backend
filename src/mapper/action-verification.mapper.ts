import { Types } from 'mongoose';
import { CreateActionVerificationDto, RequestChangeEmailDto } from '../dto/action-verification.dto';

export function mapActionVerificationToCreateActionVerification(
  dto: Omit<CreateActionVerificationDto, 'userId'> & { userId: string },
): CreateActionVerificationDto {
  return {
    userId: new Types.ObjectId(dto.userId), // convert string to ObjectId
    actionType: dto.actionType,
    actionData: dto.actionData,
  };
}

export function mapChangeEmailRequestToActionVerification(
  userId: string,
  actionType: 'emailChange' | 'passwordReset' | 'phoneUpdate',
  actionData: Record<string, unknown>,
  status: 'pending',
): RequestChangeEmailDto {
  return {
    userId: new Types.ObjectId(userId), // convert string to ObjectId
    actionType: actionType,
    actionData: actionData,
    status: status,
    passwordVerified: true,
    otpSent: true,
  };
}
