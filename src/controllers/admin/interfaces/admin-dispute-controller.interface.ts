import { Request, Response } from 'express';

export interface IAdminDisputeController {
  getDisputes(req: Request, res: Response): Promise<void>;
  getDisputeById(req: Request, res: Response): Promise<void>;
}
