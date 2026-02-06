import { Request, Response } from 'express';

export interface IAdminReportedJobController {
  getAllReportedJobs(req: Request, res: Response): Promise<void>;
  getReportsByJobId(req: Request, res: Response): Promise<void>;
}
