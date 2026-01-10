import { Request, Response } from 'express';
export interface IOtpController {
  createOtp(req: Request, res: Response): Promise<void>;
  verifyOtp(req: Request, res: Response): Promise<void>;
}
