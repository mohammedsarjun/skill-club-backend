import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IFreelancerDisputeController } from './interfaces/freelancer-dispute-controller.interface';
import { IFreelancerDisputeService } from '../../services/freelancerServices/interfaces/freelancer-dispute-service.interface';
import { HttpStatus } from '../../enums/http-status.enum';
import { CreateDisputeRequestDTO, RaiseDisputeForCancelledContractDTO } from '../../dto/freelancerDTO/freelancer-dispute.dto';

@injectable()
export class FreelancerDisputeController implements IFreelancerDisputeController {
  private _freelancerDisputeService: IFreelancerDisputeService;

  constructor(
    @inject('IFreelancerDisputeService') freelancerDisputeService: IFreelancerDisputeService,
  ) {
    this._freelancerDisputeService = freelancerDisputeService;
  }

  async createDispute(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const data: CreateDisputeRequestDTO = req.body;

    const result = await this._freelancerDisputeService.createDispute(freelancerId, data);

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Dispute created successfully',
      data: result,
    });
  }

  async getDisputeById(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { disputeId } = req.params;

    const result = await this._freelancerDisputeService.getDisputeById(freelancerId, disputeId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Dispute fetched successfully',
      data: result,
    });
  }

  async getDisputesByContract(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;

    const result = await this._freelancerDisputeService.getDisputesByContract(
      freelancerId,
      contractId,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Disputes fetched successfully',
      data: result,
    });
  }

  async raiseDisputeForCancelledContract(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;
    const data: RaiseDisputeForCancelledContractDTO = req.body;

    const result = await this._freelancerDisputeService.raiseDisputeForCancelledContract(
      freelancerId,
      contractId,
      data,
    );

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Dispute raised successfully',
      data: result,
    });
  }

  async cancelContractWithDispute(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;
    const { reasonCode, description } = req.body;

    const result = await this._freelancerDisputeService.cancelContractWithDispute(
      freelancerId,
      contractId,
      reasonCode,
      description,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Contract cancelled and dispute created',
      data: result,
    });
  }
}
