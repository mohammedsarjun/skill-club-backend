import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import { IClientJobController } from './interfaces/client-job-controller.interface';
import { IClientJobService } from '../../services/clientServices/interfaces/client-job-service.interface';
import { JobQueryParams } from '../../dto/commonDTO/job-common.dto';
import { MESSAGES } from '../../contants/contants';

@injectable()
export class ClientJobController implements IClientJobController {
  private _clientJobService: IClientJobService;
  constructor(@inject('IClientJobService') clientJobService: IClientJobService) {
    this._clientJobService = clientJobService;
  }

  async createJob(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { jobData } = req.body;

    const result = await this._clientJobService.createJob(userId as string, jobData);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.JOB.CREATED,
      data: result,
    });
  }

  async getAllJobs(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const queryParams = req.query as unknown as JobQueryParams;
    const result = await this._clientJobService.getAllJobs(userId as string, queryParams);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.JOB.FETCH_SUCCESS,
      data: result,
    });
  }

  async getJobDetail(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const jobId = req.params.jobId;
    const result = await this._clientJobService.getJobDetail(userId as string, jobId);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.JOB.FETCH_SUCCESS,
      data: result,
    });
  }

  async updateJobDetail(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const jobId = req.params.jobId;
    const { jobData } = req.body;

    const result = await this._clientJobService.updateJobDetail(userId as string, jobId, jobData);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.JOB.UPDATED,
      data: result,
    });
  }

  async closeJob(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const jobId = req.params.jobId;
    await this._clientJobService.closeJob(userId as string, jobId);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.JOB.CLOSED,
    });
  }
}
