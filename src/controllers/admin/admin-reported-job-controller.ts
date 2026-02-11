import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IAdminReportedJobController } from './interfaces/admin-reported-job-controller.interface';
import { IAdminReportedJobService } from '../../services/adminServices/interfaces/admin-reported-job-service.interface';
import { HttpStatus } from '../../enums/http-status.enum';
import { MESSAGES } from '../../contants/contants';

@injectable()
export class AdminReportedJobController implements IAdminReportedJobController {
  private _adminReportedJobService: IAdminReportedJobService;

  constructor(
    @inject('IAdminReportedJobService')
    adminReportedJobService: IAdminReportedJobService,
  ) {
    this._adminReportedJobService = adminReportedJobService;
  }

  async getAllReportedJobs(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this._adminReportedJobService.getAllReportedJobs(page, limit);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.REPORT.FETCH_SUCCESS,
      data: result,
    });
  }

  async getReportsByJobId(req: Request, res: Response): Promise<void> {
    const jobId = req.params.jobId;

    const result = await this._adminReportedJobService.getReportsByJobId(jobId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.REPORT.FETCH_SUCCESS,
      data: result,
    });
  }
}
