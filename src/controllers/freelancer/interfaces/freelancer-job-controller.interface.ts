import { Request, Response } from 'express';

export interface IFreelancerJobController {
  getAllJobs(req: Request, res: Response): Promise<void>;
  getJobDetail(req: Request, res: Response): Promise<void>;
}
