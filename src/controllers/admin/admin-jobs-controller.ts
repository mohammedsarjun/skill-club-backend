import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import { MESSAGES } from '../../contants/contants';
import { IAdminJobController } from './interfaces/admin-jobs-controller.interface';

import { IAdminJobService } from '../../services/adminServices/interfaces/admin-job-service.interface';
import { JobQueryParams } from '../../dto/commonDTO/job-common.dto';

@injectable()
export class AdminJobController implements IAdminJobController {
  private adminJobService: IAdminJobService;

  constructor(
    @inject('IAdminJobService')
    adminJobService: IAdminJobService,
  ) {
    this.adminJobService = adminJobService;
  }

  async getAllJobs(req: Request, res: Response): Promise<void> {
    const queryParams = req.query as unknown as JobQueryParams;
    const result = await this.adminJobService.getAllJobs(queryParams);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.JOB.FETCH_SUCCESS,
      data: result,
    });
  }

  async getJobDetail(req: Request, res: Response): Promise<void> {
    const jobId = req.params.jobId;
    const result = await this.adminJobService.getJobDetail(jobId);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.JOB.FETCH_SUCCESS,
      data: result,
    });
  }

  async approveJob(req: Request, res: Response): Promise<void> {
    const jobId = req.params.jobId;
    const result = await this.adminJobService.approveJob(jobId);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.JOB.APPROVE_SUCCESS,
      data: result,
    });
  }

  async rejectJob(req: Request, res: Response): Promise<void> {
    const jobId = req.params.jobId;
    const rejectedReason = req.body.rejectedReason;
    const result = await this.adminJobService.rejectJob(jobId, rejectedReason);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.JOB.REJECT_SUCCESS,
      data: result,
    });
  }

  async suspendJob(req: Request, res: Response): Promise<void> {
    const jobId = req.params.jobId;
    const suspendedReason = req.body.suspendedReason;
    const result = await this.adminJobService.suspendJob(jobId, suspendedReason);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.JOB.SUSPEND_SUCCESS,
      data: result,
    });
  }

  async getJobStats(_req: Request, res: Response): Promise<void> {
    const result = await this.adminJobService.getJobStats();
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.JOB.FETCH_SUCCESS,
      data: result,
    });
  }
}
