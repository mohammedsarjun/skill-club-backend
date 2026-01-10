import { Request, Response } from 'express';

export interface IFreelancerProposalController {
  createProposal(req: Request, res: Response): Promise<void>;
  getAllProposal(req: Request, res: Response): Promise<void>;
}
