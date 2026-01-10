import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';

import { MESSAGES } from '../../contants/contants';
import { IFreelancerJobController } from './interfaces/freelancer-job-controller.interface';
import { IFreelancerJobService } from '../../services/freelancerServices/interfaces/freelancer-job-service.interface';
import { FreelancerJobFiltersDto } from '../../dto/freelancerDTO/freelancer-job.dto';

@injectable()
export class FreelancerJobController implements IFreelancerJobController {
  private _freelancerJobService: IFreelancerJobService;
  constructor(@inject('IFreelancerJobService') freelancerJobService: IFreelancerJobService) {
    this._freelancerJobService = freelancerJobService;
  }

  async getAllJobs(req: Request, res: Response): Promise<void> {
    const { jobFilters } = req.query;
    const freelancerUserId = req.user?.userId;

    const result = await this._freelancerJobService.getAllJobs(
      freelancerUserId as string,
      jobFilters as unknown as FreelancerJobFiltersDto,
    );
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.JOB.FETCH_SUCCESS,
      data: result,
    });
  }

  async getJobDetail(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { jobId } = req.params;

    console.log(userId == jobId);
    const result = await this._freelancerJobService.getJobDetail(userId as string, jobId);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.JOB.FETCH_SUCCESS,
      data: result,
    });
  }
}
