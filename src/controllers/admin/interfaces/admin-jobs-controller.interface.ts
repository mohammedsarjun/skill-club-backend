import { Request, Response } from 'express';

export interface IAdminJobController {
  getAllJobs(req: Request, res: Response): Promise<void>;
  getJobDetail(req: Request, res: Response): Promise<void>;
  approveJob(req: Request, res: Response): Promise<void>;
  rejectJob(req: Request, res: Response): Promise<void>;
  suspendJob(req: Request, res: Response): Promise<void>;
  getJobStats(req: Request, res: Response): Promise<void>;
}
