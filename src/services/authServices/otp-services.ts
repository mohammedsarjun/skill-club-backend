import type { IOtp } from '../../models/interfaces/otp.model.interface';
import type { IOtpRepository } from '../../repositories/interfaces/otp-repository.interface';
import type { IOtpServices } from './interfaces/i-otp-services.interface';
import { injectable, inject } from 'tsyringe';
import sendEmailOtp from '../../utils/send-otp';
import { createOtpDigit } from '../../utils/otp-generator';

import bcrypt from 'bcryptjs';
import { HttpStatus } from '../../enums/http-status.enum';
import AppError from '../../utils/app-error';
import { GetOtpDto } from '../../dto/authDTO/otp.dto';
import { mapOtpModelToGetOtpDto } from '../../mapper/authMapper/otp.mapper';
import { ERROR_MESSAGES } from '../../contants/error-constants';

@injectable()
export class OtpService implements IOtpServices {
  private _otpRepository: IOtpRepository;

  constructor(@inject('IOtpRepository') otpRepository: IOtpRepository) {
    this._otpRepository = otpRepository;
  }

  async createOtp(
    email: string,
    purpose: 'signup' | 'forgotPassword' | 'changeEmail',
  ): Promise<GetOtpDto> {
    const otpPlain = await createOtpDigit();
    const otp = await bcrypt.hash(otpPlain, 10);

    const existingOtp = await this._otpRepository.findOne({ email });
    if (existingOtp) {
      await this._otpRepository.deleteByEmail(email);
    }

    const expiresAt = new Date(Date.now() + 70 * 1000);
    const response = await this._otpRepository.create({ email, purpose, otp, expiresAt });
    const mappedRespone = mapOtpModelToGetOtpDto(response);

    await sendEmailOtp(email, otpPlain);

    return mappedRespone;
  }

  async verifyOtp(
    email: string,
    otp: string,
  ): Promise<{ purpose: 'signup' | 'forgotPassword' | 'changeEmail' }> {
    const otpData = await this._otpRepository.findByEmail(email);

    if (!otpData) {
      throw new AppError(ERROR_MESSAGES.AUTH.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (otpData.expiresAt < new Date()) {
      throw new AppError(ERROR_MESSAGES.OTP.EXPIRED, HttpStatus.GONE);
    }

    const isMatched = await bcrypt.compare(otp, otpData.otp);

    if (!isMatched) {
      throw new AppError(ERROR_MESSAGES.OTP.INCORRECT_OTP, HttpStatus.UNAUTHORIZED);
    }

    const purpose = otpData.purpose;
    await this._otpRepository.deleteByEmail(email);
    return { purpose };
  }

  async findOtp(email: string): Promise<IOtp | null> {
    try {
      const response = await this._otpRepository.findByEmail(email);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteOtp(email: string): Promise<IOtp | null> {
    try {
      const response = await this._otpRepository.deleteByEmail(email);
      return response;
    } catch (error) {
      throw error;
    }
  }
}
