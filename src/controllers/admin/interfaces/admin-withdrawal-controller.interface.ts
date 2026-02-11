import { Request, Response } from 'express';

export interface IAdminWithdrawalController {
  getWithdrawStats(req: Request, res: Response): Promise<void>;
  getWithdrawals(req: Request, res: Response): Promise<void>;
  getWithdrawalDetail(req: Request, res: Response): Promise<void>;
  approveWithdrawal(req: Request, res: Response): Promise<void>;
  rejectWithdrawal(req: Request, res: Response): Promise<void>;
}
