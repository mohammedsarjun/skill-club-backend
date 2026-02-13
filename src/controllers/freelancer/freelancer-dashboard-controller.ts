import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import { IFreelancerDashboardController } from './interfaces/freelancer-dashboard-controller.interface';
import type { IFreelancerDashboardServices } from '../../services/freelancerServices/interfaces/freelancer-dashboard-services.interface';
import { MESSAGES } from '../../contants/contants';

@injectable()
export class FreelancerDashboardController implements IFreelancerDashboardController {
  private _freelancerDashboardService: IFreelancerDashboardServices;

  constructor(
    @inject('IFreelancerDashboardServices')
    freelancerDashboardService: IFreelancerDashboardServices,
  ) {
    this._freelancerDashboardService = freelancerDashboardService;
  }

  async getContractStats(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user!.userId;
    const result = await this._freelancerDashboardService.getContractStats(freelancerId);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.GENERAL.FETCH_SUCCESS,
      data: result,
    });
  }

  async getEarnings(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user!.userId;
    const result = await this._freelancerDashboardService.getEarnings(freelancerId);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.GENERAL.FETCH_SUCCESS,
      data: result,
    });
  }

  async getMeetings(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user!.userId;
    const result = await this._freelancerDashboardService.getMeetings(freelancerId);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.GENERAL.FETCH_SUCCESS,
      data: result,
    });
  }

  async getReviewStats(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user!.userId;
    const result = await this._freelancerDashboardService.getReviewStats(freelancerId);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.GENERAL.FETCH_SUCCESS,
      data: result,
    });
  }
}
