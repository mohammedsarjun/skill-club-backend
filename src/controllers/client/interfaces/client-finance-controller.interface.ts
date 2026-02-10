import { Request, Response } from 'express';

export interface IClientFinanceController {
  getFinanceData(req: Request, res: Response): Promise<void>;
  requestWithdrawal(req: Request, res: Response): Promise<void>;
  getWithdrawals(req: Request, res: Response): Promise<void>;
}
