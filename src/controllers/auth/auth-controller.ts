import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import type { IAuthService } from '../../services/authServices/interfaces/auth-services.interface';
import { GetUserDto } from '../../dto/authDTO/auth.dto';
import type { IAuthController } from './interfaces/auth-controller.interface';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import { UserDto } from '../../dto/user.dto';
import { jwtService } from '../../utils/jwt';
import { jwtConfig } from '../../config/jwt.config';
import { MESSAGES } from '../../contants/contants';
import type { IBlacklistedTokenService } from '../../services/commonServices/interfaces/blacklisted-token-service.interface';

@injectable()
export class AuthController implements IAuthController {
  private _authService: IAuthService;
  private _blacklistedTokenService: IBlacklistedTokenService;

  constructor(
    @inject('IAuthService') authService: IAuthService,
    @inject('IBlacklistedTokenService') blacklistedTokenService: IBlacklistedTokenService,
  ) {
    this._authService = authService;
    this._blacklistedTokenService = blacklistedTokenService;
  }


  async me(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const user: UserDto | null = await this._authService.me(userId as string);
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'User fetched successfully',
      data: user,
    });
  }
  async signup(req: Request, res: Response): Promise<void> {
    console.log(req.body);
    const user: GetUserDto = await this._authService.signup(req.body);
    res.status(HttpStatus.CREATED).json({
      success: true,
      message: MESSAGES.USER.CREATED,
      data: user,
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const user: UserDto = await this._authService.login(req.body);

    // Generate JWT token
    const payload = { userId: user.userId, activeRole: user.activeRole, roles: user.roles };
    const accessToken = jwtService.createToken(payload, jwtConfig.accessTokenMaxAge);
    const refreshToken = jwtService.createToken(payload, jwtConfig.refreshTokenMaxAge);

    res.cookie('accessToken', accessToken, {
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'none',
      path: '/',
      maxAge: jwtConfig.accessTokenMaxAge * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      path: '/',
      maxAge: jwtConfig.refreshTokenMaxAge * 1000,
    });

    res.status(HttpStatus.OK).json({
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      success: true,
      data: user,
    });
  }

  async logout(req: Request, res: Response): Promise<void> {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as
        | 'none'
        | 'lax'
        | 'strict',
      path: '/',
    };

    // Add tokens to blacklist
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (accessToken) {
      const accessTokenExpiry = new Date(Date.now() + jwtConfig.accessTokenMaxAge * 1000);
      await this._blacklistedTokenService.addTokenToBlacklist(accessToken, accessTokenExpiry);
    }

    if (refreshToken) {
      const refreshTokenExpiry = new Date(Date.now() + jwtConfig.refreshTokenMaxAge * 1000);
      await this._blacklistedTokenService.addTokenToBlacklist(refreshToken, refreshTokenExpiry);
    }

    // Clear both cookies
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.AUTH.LOGOUT_SUCCESS });
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const user = await this._authService.forgotPassword(email);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.AUTH.RESET_LINK_SENT,
      data: user,
    });
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, password } = req.body.resetData;

    const user = await this._authService.resetPassword(token, password);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.AUTH.PASSWORD_CHANGED,
      data: user,
    });
  }

  async verifyPassword(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { password } = req.body;

    await this._authService.verifyPassword(userId as string, password);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.AUTH.PASSWORD_VERIFIED,
    });
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    await this._authService.changePassword(userId as string, currentPassword, newPassword);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.AUTH.PASSWORD_CHANGED,
    });
  }

  async createActionVerification(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { password } = req.body;

    await this._authService.verifyPassword(userId as string, password);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.AUTH.PASSWORD_VERIFIED,
    });
  }

  async changeEmailRequest(req: Request, res: Response): Promise<void> {
    const { password, newEmail } = req.body;
    const userId = req.user?.userId;
    const { expiresAt } = await this._authService.changeEmailRequest(
      userId as string,
      password,
      newEmail,
    );
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Change email request accepted. OTP has been sent to your new email.',
      data: { expiresAt },
    });
  }

  async verifyEmailChange(req: Request, res: Response): Promise<void> {
    const { otp } = req.body;
    const userId = req.user?.userId;
    const result = await this._authService.verifyEmailChange(userId as string, otp);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Email Changed Successfully',
      data: result,
    });
  }

  async resendChangeEmailOtp(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const result = await this._authService.resendChangeEmailOtp(userId as string);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Otp Resent Successfully',
      data: result,
    });
  }
}
