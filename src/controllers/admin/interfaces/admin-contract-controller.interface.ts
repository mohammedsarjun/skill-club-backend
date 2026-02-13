import { Request, Response } from 'express';

export interface IAdminContractController {
  getContracts(req: Request, res: Response): Promise<void>;
  getContractDetail(req: Request, res: Response): Promise<void>;
  getContractTimeline(req: Request, res: Response): Promise<void>;
}
