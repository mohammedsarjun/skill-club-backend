import { Request, Response } from 'express';

export interface IClientFreelancerController {
  getAllFreelancers(req: Request, res: Response): Promise<void>;
  getFreelancerDetail(req: Request, res: Response): Promise<void>;
  getFreelancerPortfolio(req: Request, res: Response): Promise<void>;
}
