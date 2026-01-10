import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IAdminAuthController } from './interfaces/admin-auth-controller.interface';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import type { IAdminAuthServices } from '../../services/adminServices/interfaces/admin-auth-services.interface';
import { jwtService } from '../../utils/jwt';
import { jwtConfig } from '../../config/jwt.config';
import { MESSAGES } from '../../contants/contants';

@injectable()
export class AdminAuthController implements IAdminAuthController {
  private _adminAuthServices: IAdminAuthServices;

  constructor(
    @inject('IAdminAuthServices')
    adminAuthServices: IAdminAuthServices,
  ) {
    this._adminAuthServices = adminAuthServices;
  }

  async login(req: Request, res: Response): Promise<void> {
    this._adminAuthServices.login(req.body);

    const payload = { userId: 'admin_1', roles: ['admin'], activeRole: 'admin' };
    const accessToken = jwtService.createToken(payload, jwtConfig.accessTokenMaxAge);
    const refreshToken = jwtService.createToken(payload, jwtConfig.refreshTokenMaxAge);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV == 'production',
      sameSite: 'lax',
      maxAge: jwtConfig.accessTokenMaxAge * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV == 'production',
      sameSite: 'lax',
      maxAge: jwtConfig.refreshTokenMaxAge * 1000,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      data: payload,
    });
  }

  async logout(_req: Request, res: Response): Promise<void> {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as
        | 'none'
        | 'lax'
        | 'strict',
      path: '/',
    };

    // Clear both cookies
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    // Double insurance: explicitly overwrite with expired values
    res.cookie('accessToken', '', { ...cookieOptions, expires: new Date(0) });
    res.cookie('refreshToken', '', { ...cookieOptions, expires: new Date(0) });

    res.status(HttpStatus.OK).json({ message: MESSAGES.AUTH.LOGOUT_SUCCESS });
  }

  async me(req: Request, res: Response): Promise<void> {
    const payload = { userId: 'admin_1', roles: ['admin'], activeRole: 'admin' };
    const accessToken = jwtService.createToken(payload, jwtConfig.accessTokenMaxAge);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV == 'production',
      sameSite: 'lax',
      maxAge: jwtConfig.accessTokenMaxAge * 1000,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.ADMIN.VERIFIED,
      data: req.user,
    });
  }
}
