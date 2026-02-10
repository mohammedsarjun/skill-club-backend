import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IAdminRevenueService } from '../../services/adminServices/interfaces/admin-revenue-service.interface';
import { GetRevenueQueryDto } from '../../dto/adminDTO/admin-revenue.dto';
import { HttpStatus } from '../../enums/http-status.enum';
import { MESSAGES } from '../../contants/contants';

@injectable()
export class AdminRevenueController {
  private _adminRevenueService: IAdminRevenueService;

  constructor(@inject('IAdminRevenueService') adminRevenueService: IAdminRevenueService) {
    this._adminRevenueService = adminRevenueService;
  }

  async getRevenueData(req: Request, res: Response): Promise<void> {
    const { period, startDate, endDate } = req.query;

    const query: GetRevenueQueryDto = {
      period: period as 'thisWeek' | 'thisMonth' | 'thisYear' | 'custom',
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const data = await this._adminRevenueService.getRevenueData(query);

    res.status(HttpStatus.OK).json({
      success: true,
      data,
      message: MESSAGES.GENERAL.FETCH_SUCCESS,
    });
  }
}
