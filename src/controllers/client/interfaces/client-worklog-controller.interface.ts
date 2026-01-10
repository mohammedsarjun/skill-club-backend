import { Request, Response } from 'express';

export interface IClientWorklogController {
  getWorklogsByContract(req: Request, res: Response): Promise<void>;
  getWorklogDetail(req: Request, res: Response): Promise<void>;
  approveWorklog(req: Request, res: Response): Promise<void>;
  rejectWorklog(req: Request, res: Response): Promise<void>;
}
