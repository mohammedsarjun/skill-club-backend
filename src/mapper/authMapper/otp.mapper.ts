import { GetOtpDto } from '../../dto/authDTO/otp.dto';
import { IOtp } from '../../models/interfaces/otp.model.interface';

export const mapOtpModelToGetOtpDto = (modelData: IOtp): GetOtpDto => {
  return {
    email: modelData.email,
    expiresAt: modelData.expiresAt,
    purpose: modelData.purpose,
  };
};
