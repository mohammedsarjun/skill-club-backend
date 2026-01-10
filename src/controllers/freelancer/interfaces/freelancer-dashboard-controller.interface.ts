import { Request, Response } from 'express';

export interface IFreelancerDashboardController {
  getContractStats(req: Request, res: Response): Promise<void>;
  getEarnings(req: Request, res: Response): Promise<void>;
  getMeetings(req: Request, res: Response): Promise<void>;
  getReviewStats(req: Request, res: Response): Promise<void>;
}
