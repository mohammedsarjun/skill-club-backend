import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { MESSAGES } from '../../contants/contants';
import { IClientFreelancerController } from './interfaces/client-freelancer-controller.interface';
import { IClientFreelancerService } from '../../services/clientServices/interfaces/client-freelancer-service.interface';
import { freelancerParams } from '../../dto/clientDTO/client-freelancer.dto';
import { HttpStatus } from '../../enums/http-status.enum';

@injectable()
export class ClientFreelancerController implements IClientFreelancerController {
  private _clientFreelancerService: IClientFreelancerService;
  constructor(
    @inject('IClientFreelancerService') clientFreelancerService: IClientFreelancerService,
  ) {
    this._clientFreelancerService = clientFreelancerService;
  }

  async getAllFreelancers(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const queryFilter = req.query as unknown;
    const freelancerData = await this._clientFreelancerService.getAllFreelancers(
      userId as string,
      queryFilter as freelancerParams,
    );

    // Ensure response always includes freelancers array and totalCount
    const responsePayload = freelancerData
      ? { freelancers: freelancerData.freelancers, totalCount: freelancerData.totalCount }
      : { freelancers: [], totalCount: 0 };

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.Freelancer.FETCH_SUCCESS,
      data: responsePayload,
    });
  }

  async getFreelancerDetail(req: Request, res: Response): Promise<void> {
    const userClientId = req.user?.userId;
    const freelancerId = req.params.freelancerId;
    const freelancerData = await this._clientFreelancerService.getFreelancerDetail(
      userClientId as string,
      freelancerId as string,
    );
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.Freelancer.FETCH_SUCCESS,
      data: freelancerData,
    });
  }

  async getFreelancerPortfolio(req: Request, res: Response): Promise<void> {
    const userClientId = req.user?.userId;
    const freelancerId = req.params.freelancerId;
    const portfolioData = await this._clientFreelancerService.getFreelancerPortfolio(
      userClientId as string,
      freelancerId as string,
    );
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.PORTFOLIO.PORTFOLIO_FETCH_SUCCESS,
      data: portfolioData,
    });
  }
}
