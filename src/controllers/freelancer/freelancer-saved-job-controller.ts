import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { MESSAGES } from '../../contants/contants';
import { HttpStatus } from '../../enums/http-status.enum';
import { IFreelancerSavedJobService } from '../../services/freelancerServices/interfaces/freelancer-saved-job-service.interface';

@injectable()
export class FreelancerSavedJobController {
  private _freelancerSavedJobService: IFreelancerSavedJobService;

  constructor(
    @inject('IFreelancerSavedJobService') freelancerSavedJobService: IFreelancerSavedJobService,
  ) {
    this._freelancerSavedJobService = freelancerSavedJobService;
  }

  async toggleSaveJob(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const jobId = req.params.jobId as string;

    const result = await this._freelancerSavedJobService.toggleSaveJob(freelancerId, jobId);
    res.status(HttpStatus.OK).json({
      success: true,
      message: result.saved ? MESSAGES.SAVED_JOB.SAVED : MESSAGES.SAVED_JOB.UNSAVED,
      data: { saved: result.saved },
    });
  }

  async isJobSaved(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const jobId = req.params.jobId as string;
    const saved = await this._freelancerSavedJobService.isJobSaved(freelancerId, jobId);
    res.status(HttpStatus.OK).json({
      success: true,
      data: { saved },
    });
  }

  async getSavedJobs(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { page, limit } = req.query as Record<string, string>;
    const result = await this._freelancerSavedJobService.getSavedJobs(freelancerId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.SAVED_JOB.FETCH_SUCCESS,
      data: result,
    });
  }
}

export default FreelancerSavedJobController;
