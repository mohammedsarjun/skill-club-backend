import { Request, Response } from 'express';

export interface IFreelancerWorklogController {
  submitWorklog(req: Request, res: Response): Promise<void>;
  getWorklogsByContract(req: Request, res: Response): Promise<void>;
  getWorklogsList(req: Request, res: Response): Promise<void>;
  getWorklogDetail(req: Request, res: Response): Promise<void>;
  checkWorklogValidation(req: Request, res: Response): Promise<void>;
}
