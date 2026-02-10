import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IFreelancerWorklogController } from './interfaces/freelancer-worklog-controller.interface';
import { IFreelancerWorklogService } from '../../services/freelancerServices/interfaces/freelancer-worklog-service.interface';
import { HttpStatus } from '../../enums/http-status.enum';
import { SubmitWorklogDTO } from '../../dto/freelancerDTO/freelancer-worklog.dto';
import { RaiseWorklogDisputeDTO } from '../../dto/freelancerDTO/freelancer-worklog-dispute.dto';

@injectable()
export class FreelancerWorklogController implements IFreelancerWorklogController {
  private _freelancerWorklogService: IFreelancerWorklogService;

  constructor(
    @inject('IFreelancerWorklogService') freelancerWorklogService: IFreelancerWorklogService
  ) {
    this._freelancerWorklogService = freelancerWorklogService;
  }

  async submitWorklog(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const data: SubmitWorklogDTO = req.body;

    const result = await this._freelancerWorklogService.submitWorklog(freelancerId, data);

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Worklog submitted successfully',
      data: result,
    });
  }

  async getWorklogsByContract(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;

    const result = await this._freelancerWorklogService.getWorklogsByContract(freelancerId, contractId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Worklogs fetched successfully',
      data: result,
    });
  }

  async getWorklogsList(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string | undefined;

    const result = await this._freelancerWorklogService.getWorklogsListByContract(
      freelancerId,
      contractId,
      page,
      limit,
      status
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Worklogs list fetched successfully',
      data: result,
    });
  }

  async getWorklogDetail(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId, worklogId } = req.params;

    const result = await this._freelancerWorklogService.getWorklogDetail(freelancerId, contractId, worklogId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Worklog detail fetched successfully',
      data: result,
    });
  }

  async checkWorklogValidation(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;

    const result = await this._freelancerWorklogService.checkWorklogValidation(freelancerId, contractId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Worklog validation checked successfully',
      data: result,
    });
  }

  async raiseWorklogDispute(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;
    const data: RaiseWorklogDisputeDTO = req.body;

    const result = await this._freelancerWorklogService.raiseWorklogDispute(freelancerId, contractId, data);

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Worklog dispute raised successfully',
      data: result,
    });
  }
}
