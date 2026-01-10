import { GetOtpDto } from '../../../dto/authDTO/otp.dto';
import { IOtp } from '../../../models/interfaces/otp.model.interface';

export interface IOtpServices {
  createOtp(
    email: string,
    purpose: 'signup' | 'forgotPassword' | 'changeEmail',
  ): Promise<GetOtpDto>;
  verifyOtp(
    email: string,
    otp: string,
  ): Promise<{ purpose: 'signup' | 'forgotPassword' | 'changeEmail' }>;
  findOtp(email: string): Promise<IOtp | null>;
  deleteOtp(email: string): Promise<IOtp | null>;
}
