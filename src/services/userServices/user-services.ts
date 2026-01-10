import { injectable, inject } from 'tsyringe';
import { IUserServices } from './interfaces/user-services.interface';
import type { IUserRepository } from '../../repositories/interfaces/user-repository.interface';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import {
  mapAddressDtoToUserModel,
  mapClientDtoToUserModel,
  mapFreelancerDtoToUserModel,
  mapUserModelToAddressDto,
  mapUserModelToClientProfileUpdateResponseDto,
  mapUserModelToUserDto,
  mapUserModelToUserProfileDto,
  UserDetailDtoToUserModel,
} from '../../mapper/user.mapper';
import {
  AddressDTO,
  ClientProfileDetailDTO,
  ClientProfileUpdateResponseDto,
  UserDto,
  UserProfileDto,
} from '../../dto/user.dto';
import { IUser } from '../../models/interfaces/user.model.interface';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { mapActionVerificationToCreateActionVerification } from '../../mapper/action-verification.mapper';
import type { IActionVerificationRepository } from '../../repositories/interfaces/action-verification-repository.interface';
import { userProfileSchema } from '../../utils/validationSchemas/validations';
import { validateData } from '../../utils/validation';

@injectable()
export class userServices implements IUserServices {
  private _userRepository: IUserRepository;
  private _actionVerificationRepository: IActionVerificationRepository;
  constructor(
    @inject('IUserRepository') userRepository: IUserRepository,
    @inject('IActionVerificationRepository')
    actionVerificationRepository: IActionVerificationRepository,
  ) {
    this._userRepository = userRepository;
    this._actionVerificationRepository = actionVerificationRepository;
  }

  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return mapUserModelToUserProfileDto(user);
  }

  async markUserVerified(id: string): Promise<void> {
    try {
      await this._userRepository.updateById(id, { $set: { isVerified: true } });
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new AppError(`Failed to verify user: ${err.message}`, HttpStatus.UNAUTHORIZED);
      }
      throw new AppError('Failed to verify user: Unknown error', HttpStatus.UNAUTHORIZED);
    }
  }

  async selectRole(id: string | undefined, role: string): Promise<UserDto> {
    const user = await this._userRepository.findById(id!);
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (user.roles.includes(role)) {
      return mapUserModelToUserDto(user);
    }

    const updatedUser = await this._userRepository.addRoleAndCompleteOnboarding(id!, role);

    return mapUserModelToUserDto(updatedUser!);
  }

  async createFreelancerProfile(id: string, freelancerData: Partial<IUser>): Promise<IUser> {
    const dto = mapFreelancerDtoToUserModel(freelancerData);
    if (!id) {
      throw new AppError(ERROR_MESSAGES.USER.ID_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    if (!dto || Object.keys(dto).length === 0) {
      throw new AppError('Freelancer data cannot be empty', HttpStatus.BAD_REQUEST);
    }

    try {
      const updatedUser = await this._userRepository.createFreelancerProfile(id, dto);
      if (!updatedUser) {
        throw new AppError(ERROR_MESSAGES.USER.NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      return updatedUser;
    } catch (error: unknown) {
      console.log(error);
      throw new AppError(ERROR_MESSAGES.FREELANCER.FAILED_CREATE, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createClientProfile(
    id: string,
    clientData: ClientProfileDetailDTO,
  ): Promise<ClientProfileUpdateResponseDto> {
    if (!id) {
      throw new AppError(ERROR_MESSAGES.USER.ID_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    try {
      const clientdto = mapClientDtoToUserModel(clientData);
      const updatedUser = await this._userRepository.updateById(id, clientdto);

      if (!updatedUser) {
        throw new AppError(ERROR_MESSAGES.USER.NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      const clientResponseDto = mapUserModelToClientProfileUpdateResponseDto(updatedUser);
      return clientResponseDto;
    } catch (error) {
      throw new AppError(ERROR_MESSAGES.CLIENT.FAILED_CREATE, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async switchRole(id: string): Promise<UserDto> {
    const user = await this._userRepository.findById(id);

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (user?.roles && user?.roles.length < 2) {
      throw new AppError(`User Didn't Have Enough Role`, HttpStatus.BAD_REQUEST);
    }

    const updatedUser = await this._userRepository.updateById(id, {
      activeRole: user.activeRole === 'client' ? 'freelancer' : 'client',
    });

    const dto = mapUserModelToUserDto(updatedUser!);

    return dto;
  }

  async me(id: string): Promise<UserDto> {
    const user = await this._userRepository.findById(id);

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const dto = mapUserModelToUserDto(user);

    return dto;
  }

  async getAddress(userId: string): Promise<AddressDTO | null> {
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (!user.address) {
      return null;
    }

    return mapUserModelToAddressDto(user);
  }

  async updateAddress(userId: string, address: AddressDTO): Promise<AddressDTO | null> {
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const updatedAddress = mapAddressDtoToUserModel(address);

    const updatedUser = await this._userRepository.updateUserAddress(userId, updatedAddress);

    if (!updatedUser || !updatedUser.address) {
      return null;
    }

    return mapUserModelToAddressDto(updatedUser);
  }

  async createActionVerification(
    userId: string,
    actionType: 'emailChange' | 'passwordReset' | 'phoneUpdate',
    actionData: Record<string, unknown>,
  ): Promise<void> {
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const dto = mapActionVerificationToCreateActionVerification({ userId, actionType, actionData });

    this._actionVerificationRepository.createActionVerificaion(dto);
  }

  async updateUserProfile(userId: string, profileData: UserProfileDto): Promise<UserProfileDto> {
    validateData(userProfileSchema, profileData);
    if (!userId) {
      throw new AppError(ERROR_MESSAGES.USER.ID_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const dto = UserDetailDtoToUserModel(profileData);

    try {
      const updatedUser = await this._userRepository.updateUserProfile(userId, dto);

      if (!updatedUser) {
        throw new AppError(ERROR_MESSAGES.USER.NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      return updatedUser;
    } catch (error: unknown) {
      console.log(error);
      throw new AppError(ERROR_MESSAGES.FREELANCER.FAILED_CREATE, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
