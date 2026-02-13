import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IFreelancerContractController } from './interfaces/freelancer-contract-controller.interface';
import { IFreelancerContractService } from '../../services/freelancerServices/interfaces/freelancer-contract-service.interface';
import { HttpStatus } from '../../enums/http-status.enum';
import { FreelancerContractQueryParamsDTO } from '../../dto/freelancerDTO/freelancer-contract.dto';
import { SubmitDeliverableDTO } from '../../dto/freelancerDTO/freelancer-deliverable.dto';
import {
  SubmitMilestoneDeliverableDTO,
  RequestMilestoneExtensionDTO,
} from '../../dto/freelancerDTO/freelancer-milestone.dto';
import { RequestContractExtensionDTO } from '../../dto/freelancerDTO/freelancer-contract-extension.dto';
import { AcceptCancellationRequestDTO } from '../../dto/freelancerDTO/freelancer-cancellation-request.dto';
import { CreateFreelancerCancellationRequestDTO } from '../../dto/freelancerDTO/freelancer-create-cancellation-request.dto';

@injectable()
export class FreelancerContractController implements IFreelancerContractController {
  private _freelancerContractService: IFreelancerContractService;

  constructor(
    @inject('IFreelancerContractService') freelancerContractService: IFreelancerContractService,
  ) {
    this._freelancerContractService = freelancerContractService;
  }

  async getContracts(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { search, page, limit, status } = req.query;

    const query: FreelancerContractQueryParamsDTO = {
      search: search as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      filters: {
        status: status as FreelancerContractQueryParamsDTO['filters']['status'],
      },
    };

    const result = await this._freelancerContractService.getAllContracts(freelancerId, query);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Contracts fetched successfully',
      data: result,
    });
  }

  async getContractDetail(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;

    const result = await this._freelancerContractService.getContractDetail(
      freelancerId,
      contractId,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Contract detail fetched successfully',
      data: result,
    });
  }

  async cancelContract(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;
    const { cancelContractReason } = req.body;

    const result = await this._freelancerContractService.cancelContract(
      freelancerId,
      contractId,
      cancelContractReason,
    );

    res
      .status(HttpStatus.OK)
      .json({ success: true, message: 'Contract cancellation processed', data: result });
  }

  async submitDeliverable(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;
    const data: SubmitDeliverableDTO = req.body;

    const result = await this._freelancerContractService.submitDeliverable(
      freelancerId,
      contractId,
      data,
    );

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Deliverable submitted successfully',
      data: result,
    });
  }

  async submitMilestoneDeliverable(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;
    const data: SubmitMilestoneDeliverableDTO = req.body;

    const result = await this._freelancerContractService.submitMilestoneDeliverable(
      freelancerId,
      contractId,
      data,
    );

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Milestone deliverable submitted successfully',
      data: result,
    });
  }

  async requestMilestoneExtension(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;
    const data: RequestMilestoneExtensionDTO = req.body;

    const result = await this._freelancerContractService.requestMilestoneExtension(
      freelancerId,
      contractId,
      data,
    );

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Extension request submitted successfully',
      data: result,
    });
  }

  async requestContractExtension(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;
    const data: RequestContractExtensionDTO = req.body;

    const result = await this._freelancerContractService.requestContractExtension(
      freelancerId,
      contractId,
      data,
    );

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Contract extension request submitted successfully',
      data: result,
    });
  }

  async approveChangeRequest(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId, deliverableId } = req.params;
    const result = await this._freelancerContractService.approveChangeRequest(
      freelancerId,
      contractId,
      deliverableId,
    );
    res
      .status(HttpStatus.OK)
      .json({ success: true, message: 'Change request approved', data: result });
  }

  async getCancellationRequest(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;

    const result = await this._freelancerContractService.getCancellationRequest(
      freelancerId,
      contractId,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Cancellation request fetched successfully',
      data: result,
    });
  }

  async acceptCancellationRequest(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;
    const data: AcceptCancellationRequestDTO = req.body;

    const result = await this._freelancerContractService.acceptCancellationRequest(
      freelancerId,
      contractId,
      data,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: result.message,
      data: result,
    });
  }

  async raiseCancellationDispute(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;
    const { notes } = req.body;

    const result = await this._freelancerContractService.raiseCancellationDispute(
      freelancerId,
      contractId,
      notes,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: result.message,
      data: result,
    });
  }

  async createCancellationRequest(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;
    const data: CreateFreelancerCancellationRequestDTO = req.body;

    const result = await this._freelancerContractService.createCancellationRequest(
      freelancerId,
      contractId,
      data,
    );

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Cancellation request created successfully',
      data: result,
    });
  }

  async endHourlyContract(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;

    const result = await this._freelancerContractService.endHourlyContract(
      freelancerId,
      contractId,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: result.message,
      data: result,
    });
  }
}
