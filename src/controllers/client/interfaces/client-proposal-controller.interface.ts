import { Request, Response } from 'express';
export interface IClientProposalController {
  getAllProposal(req: Request, res: Response): Promise<void>;
  getProposalDetail(req: Request, res: Response): Promise<void>;
  rejectProposal(req: Request, res: Response): Promise<void>;
}
