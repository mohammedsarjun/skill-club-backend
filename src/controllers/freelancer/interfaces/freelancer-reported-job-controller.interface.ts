import { Request, Response } from 'express';

export interface IFreelancerReportedJobController {
  reportJob(req: Request, res: Response): Promise<void>;
  isJobReported(req: Request, res: Response): Promise<void>;
}

export default IFreelancerReportedJobController;
