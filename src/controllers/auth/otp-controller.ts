import { inject, injectable } from 'tsyringe';
import { IOtpController } from './interfaces/otp-controller.interface';
import { Request, Response } from 'express';
import type { IOtpServices } from '../../services/authServices/interfaces/i-otp-services.interface';
import { HttpStatus } from '../../enums/http-status.enum';
import type { IUserServices } from '../../services/userServices/interfaces/user-services.interface';
import { jwtService } from '../../utils/jwt';
import { jwtConfig } from '../../config/jwt.config';

@injectable()
export class OtpController implements IOtpController {
  private _otpServices: IOtpServices;
  private _userServices: IUserServices;
  constructor(
    @inject('IOtpServices') otpService: IOtpServices,
    @inject('IUserServices') userServices: IUserServices,
  ) {
    this._otpServices = otpService;
    this._userServices = userServices;
  }
  async createOtp(req: Request, res: Response): Promise<void> {
    const { email, purpose } = req.body;

    const otpResponse = await this._otpServices.createOtp(email, purpose);
    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Otp Sent Successfully',
      data: otpResponse,
      purpose,
    });
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    const { email, otp, userId } = req.body;
    const response = await this._otpServices.verifyOtp(email, otp);

    switch (response.purpose) {
      case 'signup':
        await this._userServices.markUserVerified(userId);

        // 🔹 Create tokens
        const payload = {userId:userId}
        const accessToken = jwtService.createToken(payload, jwtConfig.accessTokenMaxAge);
        const refreshToken = jwtService.createToken(payload, jwtConfig.refreshTokenMaxAge);

        res.cookie('accessToken', accessToken, {
          httpOnly: process.env.NODE_ENV === 'production',
          secure: process.env.NODE_ENV === 'production', // 🔹 must be false on localhost (no HTTPS)
           sameSite: 'none',
      path: '/',
          maxAge: jwtConfig.accessTokenMaxAge * 1000,
        });

        res.cookie('refreshToken', refreshToken, {
          httpOnly: process.env.NODE_ENV === 'production',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: jwtConfig.refreshTokenMaxAge * 1000,
        });

        break;
      case 'forgotPassword':
        // maybe return a token or flag to allow password reset
        // await otpService.markOtpUsed(otpRecord.email);
        break;
      default:
        throw new Error('Unknown OTP purpose');
    }

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Otp Verfied Successfully',
      data: response,
    });
  }
}
