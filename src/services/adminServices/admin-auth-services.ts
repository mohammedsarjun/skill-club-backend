import { injectable } from 'tsyringe';
import { IAdminAuthServices } from './interfaces/admin-auth-services.interface';

import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { ERROR_MESSAGES } from '../../contants/error-constants';

@injectable()
export class AdminAuthServices implements IAdminAuthServices {
  constructor() {}

  login(adminData: { email: string; password: string }): void {
    const adminEmail = process.env.SUPER_ADMIN_USERNAME;
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD;

    if (adminEmail != adminData?.email || adminPassword != adminData?.password)
      throw new AppError(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
  }
}
