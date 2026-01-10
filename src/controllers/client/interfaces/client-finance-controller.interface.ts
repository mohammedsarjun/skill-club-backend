import { Request, Response } from 'express';

export interface IClientFinanceController {
  getFinanceData(req: Request, res: Response): Promise<void>;
}
