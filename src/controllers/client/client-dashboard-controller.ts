import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import { IClientDashboardController } from './interfaces/client-dashboard-controller.interface';
import { IClientDashboardService } from '../../services/clientServices/interfaces/client-dashboard-service.interface';

@injectable()
export class ClientDashboardController implements IClientDashboardController {
  private _clientDashboardService: IClientDashboardService;

  constructor(@inject('IClientDashboardService') clientDashboardService: IClientDashboardService) {
    this._clientDashboardService = clientDashboardService;
  }

  async getDashboardData(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId;
    const result = await this._clientDashboardService.getDashboardData(clientId!);
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Dashboard data fetched successfully',
      data: result,
    });
  }
}
