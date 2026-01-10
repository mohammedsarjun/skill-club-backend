import { Request, Response } from 'express';

export interface IFreelancerDisputeController {
  createDispute(req: Request, res: Response): Promise<void>;
  getDisputeById(req: Request, res: Response): Promise<void>;
  getDisputesByContract(req: Request, res: Response): Promise<void>;
  cancelContractWithDispute(req: Request, res: Response): Promise<void>;
}
