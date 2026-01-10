import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import { IAdminDashboardController } from './interfaces/admin-dashboard-controller.interface';
import type { IAdminDashboardServices } from '../../services/adminServices/interfaces/admin-dashboard-services.interface';
import { MESSAGES } from '../../contants/contants';

@injectable()
export class AdminDashboardController implements IAdminDashboardController {
  private _adminDashboardService: IAdminDashboardServices;

  constructor(
    @inject('IAdminDashboardServices') adminDashboardService: IAdminDashboardServices,
  ) {
    this._adminDashboardService = adminDashboardService;
  }

  async getDashboardStats(_req: Request, res: Response): Promise<void> {
    const result = await this._adminDashboardService.getDashboardStats();
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.GENERAL.FETCH_SUCCESS,
      data: result,
    });
  }

  async getRevenueData(req: Request, res: Response): Promise<void> {
    const { year } = req.query;
    const result = await this._adminDashboardService.getRevenueData(
      year ? Number(year) : undefined,
    );
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.GENERAL.FETCH_SUCCESS,
      data: result,
    });
  }

  async getUserGrowthData(req: Request, res: Response): Promise<void> {
    const { year } = req.query;
    const result = await this._adminDashboardService.getUserGrowthData(
      year ? Number(year) : undefined,
    );
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.GENERAL.FETCH_SUCCESS,
      data: result,
    });
  }

  async getRecentContracts(req: Request, res: Response): Promise<void> {
    const { limit } = req.query;
    const result = await this._adminDashboardService.getRecentContracts(
      limit ? Number(limit) : undefined,
    );
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.GENERAL.FETCH_SUCCESS,
      data: result,
    });
  }

  async getRecentReviews(req: Request, res: Response): Promise<void> {
    const { limit } = req.query;
    const result = await this._adminDashboardService.getRecentReviews(
      limit ? Number(limit) : undefined,
    );
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.GENERAL.FETCH_SUCCESS,
      data: result,
    });
  }
}
