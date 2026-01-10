import type { IAuthService } from './interfaces/auth-services.interface';
import type { IUserRepository } from '../../repositories/interfaces/user-repository.interface';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { CreateUserDTO, GetUserDto, LoginUserDto } from '../../dto/authDTO/auth.dto';
import {
  mapCreateUserDtoToUserModel,
  mapUserModelToGetUserDto,
} from '../../mapper/authMapper/auth.mapper';
import bcrypt from 'bcryptjs';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { UserDto, UserProfileDto } from '../../dto/user.dto';
import { mapUserModelToUserDto, mapUserModelToUserProfileDto } from '../../mapper/user.mapper';
import { genRandom } from '../../utils/crypto-generator';
import sendEmailOtp from '../../utils/send-otp';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { IActionVerificationRepository } from '../../repositories/interfaces/action-verification-repository.interface';
import { IOtpServices } from './interfaces/i-otp-services.interface';

import { mapChangeEmailRequestToActionVerification } from '../../mapper/action-verification.mapper';

@injectable()
export class AuthService implements IAuthService {
  private _userRepository: IUserRepository;
  private _actionVerificationRepository: IActionVerificationRepository;
  private _otpService: IOtpServices;
  constructor(
    @inject('IUserRepository') userRepository: IUserRepository,
    @inject('IActionVerificationRepository')
    actionVerificationRepository: IActionVerificationRepository,
    @inject('IOtpServices') otpService: IOtpServices,
  ) {
    this._userRepository = userRepository;
    this._actionVerificationRepository = actionVerificationRepository;
    this._otpService = otpService;
  }
  async signup(userData: CreateUserDTO): Promise<GetUserDto> {
    const dto = mapCreateUserDtoToUserModel(userData);

    // Check if a verified user exists
    const verifiedUser = await this._userRepository.findOne({ email: dto.email, isVerified: true });

    if (verifiedUser) {
      throw new AppError(ERROR_MESSAGES.AUTH.ALREADY_EXIST, HttpStatus.CONFLICT);
    }

    // Check if an unverified user exists
    let user = await this._userRepository.findOne({
      email: dto.email,
      isVerified: false,
    });

    if (user) {
      // Update existing unverified user with new info
      user.firstName = dto.firstName;
      user.lastName = dto.lastName;
      user.password = await bcrypt.hash(dto.password!, 10);
      user.phone = dto.phone!;
      user = await this._userRepository.updateById(user._id.toString(), user);
    } else {
      // Create a new user
      dto.password = await bcrypt.hash(dto.password!, 10);
      user = await this._userRepository.create(dto);
    }

    if (!user) {
      throw new AppError('Failed to create or update user', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return mapUserModelToGetUserDto(user);
  }

  async login(userData: LoginUserDto): Promise<UserDto> {
    // Normalize email to lowercase
    const email = userData.email.toLowerCase();

    const user = await this._userRepository.findOne({ email, isVerified: true });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.AUTH.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const isPasswordMatch = await bcrypt.compare(userData.password, user.password!);
    if (!isPasswordMatch) {
      throw new AppError(ERROR_MESSAGES.AUTH.INCORRECT_PASSWORD, HttpStatus.UNAUTHORIZED);
    }

    const dto = mapUserModelToUserDto(user);
    return dto;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this._userRepository.findOne({ email });
    if (!user) {
      throw new AppError(ERROR_MESSAGES.AUTH.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const tokenDetail = await genRandom();
    const token = tokenDetail.token;
    const expiry = new Date(tokenDetail.expiry);

    await this._userRepository.updateResetPassword(user._id, token, expiry);

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendEmailOtp(user.email, `Click here to reset your password: ${resetLink}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this._userRepository.findByResetToken(token);

    if (!user) {
      throw new AppError(ERROR_MESSAGES.TOKEN.INVALID_TOKEN, HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this._userRepository.updatePassword(user._id, hashedPassword);

    await sendEmailOtp(user.email, 'Your password has been successfully reset.');
  }

  async verifyPassword(userId: string, password: string): Promise<void> {
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (!user.password && user.googleId) {
      throw new AppError(
        'Password verification is not applicable for Google-authenticated users.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password!);

    if (!isPasswordMatched) {
      throw new AppError(ERROR_MESSAGES.AUTH.INCORRECT_PASSWORD, HttpStatus.UNAUTHORIZED);
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await this.verifyPassword(userId, currentPassword);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this._userRepository.updatePassword(userId, hashedPassword);
  }

  async changeEmailRequest(
    userId: string,
    password: string,
    newEmail: string,
  ): Promise<{ expiresAt: Date }> {
    // Verify password
    await this.verifyPassword(userId, password);
    // Check if new email already exists
    const emailExists = await this._userRepository.findByEmail(newEmail);
    if (emailExists)
      throw new AppError(ERROR_MESSAGES.AUTH.EMAIL_ALREADY_EXIST, HttpStatus.CONFLICT);

    const { expiresAt } = await this._otpService.createOtp(newEmail, 'changeEmail');
    const changeEmailRequestDto = mapChangeEmailRequestToActionVerification(
      userId,
      'emailChange',
      { newEmail },
      'pending',
    );

    const emailChangeRequest = await this._actionVerificationRepository.findOneByUserId(userId);

    if (emailChangeRequest) {
      await this._actionVerificationRepository.changeActionVerificationStatus(userId, 'failed');
    }

    await this._actionVerificationRepository.saveEmailChangeRequest(changeEmailRequestDto);

    return { expiresAt };
  }

  async verifyEmailChange(userId: string, otp: string): Promise<UserProfileDto | null> {
    const emailChangeRequest = await this._actionVerificationRepository.findOneByUserId(userId);

    if (!emailChangeRequest) {
      throw new AppError(
        ERROR_MESSAGES.ACTION_VERIFICATION.CHANGE_EMAIL.NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    if (!emailChangeRequest.passwordVerified) {
      throw new AppError(
        ERROR_MESSAGES.ACTION_VERIFICATION.CHANGE_EMAIL.PASSWORD_NOT_VERFIED,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!emailChangeRequest.otpSent) {
      throw new AppError(
        ERROR_MESSAGES.ACTION_VERIFICATION.CHANGE_EMAIL.OTP_NOT_SENT,
        HttpStatus.BAD_REQUEST,
      );
    }

    const { newEmail } = emailChangeRequest.actionData;

    await this._otpService.verifyOtp(newEmail as string, otp);
    const user = await this._userRepository.updateEmail(userId, newEmail as string);
    await this._actionVerificationRepository.changeActionVerificationStatus(userId, 'completed');
    return user ? mapUserModelToUserProfileDto(user) : null;
  }

  async resendChangeEmailOtp(userId: string): Promise<{ expiresAt: Date }> {
    const emailChangeRequest = await this._actionVerificationRepository.findOneByUserId(userId);

    if (!emailChangeRequest) {
      throw new AppError(
        ERROR_MESSAGES.ACTION_VERIFICATION.CHANGE_EMAIL.NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    if (!emailChangeRequest.passwordVerified) {
      throw new AppError(
        ERROR_MESSAGES.ACTION_VERIFICATION.CHANGE_EMAIL.PASSWORD_NOT_VERFIED,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!emailChangeRequest.otpSent) {
      throw new AppError(
        ERROR_MESSAGES.ACTION_VERIFICATION.CHANGE_EMAIL.OTP_NOT_SENT,
        HttpStatus.BAD_REQUEST,
      );
    }

    const { newEmail } = emailChangeRequest.actionData;

    const { expiresAt } = await this._otpService.createOtp(newEmail as string, 'changeEmail');

    return { expiresAt };
  }
}
