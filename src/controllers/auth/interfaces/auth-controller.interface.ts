import { Request, Response } from 'express';
export interface IAuthController {
  signup(req: Request, res: Response): Promise<void>;
  login(req: Request, res: Response): Promise<void>;
  forgotPassword(req: Request, res: Response): Promise<void>;
  resetPassword(req: Request, res: Response): Promise<void>;
  logout(req: Request, res: Response): Promise<void>;
  verifyPassword(req: Request, res: Response): Promise<void>;
  changePassword(req: Request, res: Response): Promise<void>;
  createActionVerification(req: Request, res: Response): Promise<void>;
  changeEmailRequest(req: Request, res: Response): Promise<void>;
  resendChangeEmailOtp(req: Request, res: Response): Promise<void>;
  verifyEmailChange(req: Request, res: Response): Promise<void>;
}
