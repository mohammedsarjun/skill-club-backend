import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IClientProposalController } from './interfaces/client-proposal-controller.interface';
import { IClientProposalService } from '../../services/clientServices/interfaces/client-proposal-service.interface';

@injectable()
export class ClientProposalController implements IClientProposalController {
  private _clientProposalService: IClientProposalService;
  constructor(@inject('IClientProposalService') clientProposalService: IClientProposalService) {
    this._clientProposalService = clientProposalService;
  }
  async getAllProposal(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const jobId = req.params.jobId;
    const queryFilters = req.query as unknown as Record<string, unknown>;
    console.log(queryFilters);
    const result = await this._clientProposalService.getAllProposal(
      userId as string,
      jobId as string,
      queryFilters,
    );
    res.status(200).json({
      success: true,
      message: 'Proposals fetched successfully',
      data: result,
    });
  }

  async getProposalDetail(req: Request, res: Response): Promise<void> {
    const proposalId = req.params.proposalId;
    const result = await this._clientProposalService.getProposalDetail(proposalId);
    res.status(200).json({
      success: true,
      message: 'Proposal detail fetched successfully',
      data: result,
    });
  }

  async rejectProposal(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const proposalId = req.params.proposalId as string;
    const result = await this._clientProposalService.rejectProposal(clientId, proposalId);
    res
      .status(200)
      .json({ success: true, message: 'Proposal rejected successfully', data: result });
  }
}
