import { Request, Response } from 'express';

export interface IFreelancerEarningsController {
  getEarningsOverview(req: Request, res: Response): Promise<void>;
  getTransactions(req: Request, res: Response): Promise<void>;
}
