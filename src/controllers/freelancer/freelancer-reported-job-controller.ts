import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import { IFreelancerReportedJobController } from './interfaces/freelancer-reported-job-controller.interface';
import { IFreelancerReportedJobService } from '../../services/freelancerServices/interfaces/freelancer-reported-job-service.interface';
import { MESSAGES } from '../../contants/contants';

@injectable()
export class FreelancerReportedJobController implements IFreelancerReportedJobController {
  private _freelancerReportedJobService: IFreelancerReportedJobService;

  constructor(
    @inject('IFreelancerReportedJobService')
    freelancerReportedJobService: IFreelancerReportedJobService,
  ) {
    this._freelancerReportedJobService = freelancerReportedJobService;
  }

  async reportJob(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId;
    const { jobId } = req.params;
    const { reason } = req.body;

    const result = await this._freelancerReportedJobService.reportJob(
      freelancerId as string,
      jobId,
      { reason },
    );

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: MESSAGES.REPORTED_JOB.REPORTED,
      data: { reported: result.reported },
    });
  }

  async isJobReported(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId;
    const { jobId } = req.params;

    const reported = await this._freelancerReportedJobService.isJobReported(
      freelancerId as string,
      jobId,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      data: { reported },
    });
  }
}
