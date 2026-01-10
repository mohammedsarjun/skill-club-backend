import { Request, Response } from 'express';

export interface IClientJobController {
  createJob(req: Request, res: Response): Promise<void>;
  getAllJobs(req: Request, res: Response): Promise<void>;
  getJobDetail(req: Request, res: Response): Promise<void>;
  updateJobDetail(req: Request, res: Response): Promise<void>;
  closeJob(req: Request, res: Response): Promise<void>;
}
