import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import { MESSAGES } from '../../contants/contants';
import { IFreelancerProposalService } from '../../services/freelancerServices/interfaces/freelancer-proposal-service.interface';
import { IFreelancerProposalController } from './interfaces/freelancer-proposal-controller.interface';

@injectable()
export class FreelancerProposalController implements IFreelancerProposalController {
  private _freelancerProposalService: IFreelancerProposalService;
  constructor(
    @inject('IFreelancerProposalService') freelancerProposalService: IFreelancerProposalService,
  ) {
    this._freelancerProposalService = freelancerProposalService;
  }

  async createProposal(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { proposalData } = req.body;

    await this._freelancerProposalService.createProposal(userId as string, proposalData);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.PROPOSAL.CREATED,
    });
  }

  async getAllProposal(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const jobId = req.params.jobId;
    const queryFilters = req.query as unknown as Record<string, unknown>;
    const result = await this._freelancerProposalService.getAllProposal(
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
}
