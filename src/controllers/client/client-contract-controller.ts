import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IClientContractController } from './interfaces/client-contract-controller.interface';
import { IClientContractService } from '../../services/clientServices/interfaces/client-contract-service.interface';
import { IContractActivityService } from '../../services/commonServices/interfaces/contract-activity-service.interface';
import { HttpStatus } from '../../enums/http-status.enum';
import { ClientContractQueryParamsDTO } from '../../dto/clientDTO/client-contract.dto';
import {
  ApproveDeliverableDTO,
  RequestChangesDTO,
  DownloadDeliverableDTO,
} from '../../dto/clientDTO/client-deliverable.dto';
import {
  ApproveMilestoneDeliverableDTO,
  RequestMilestoneChangesDTO,
  RespondToExtensionDTO,
} from '../../dto/clientDTO/client-milestone.dto';
import { RespondToContractExtensionDTO } from '../../dto/clientDTO/client-contract-extension.dto';

@injectable()
export class ClientContractController implements IClientContractController {
  private _clientContractService: IClientContractService;
  private _contractActivityService: IContractActivityService;

  constructor(
    @inject('IClientContractService') clientContractService: IClientContractService,
    @inject('IContractActivityService') contractActivityService: IContractActivityService
  ) {
    this._clientContractService = clientContractService;
    this._contractActivityService = contractActivityService;
  }

  async getContracts(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { search, page, limit, status } = req.query;

    const query: ClientContractQueryParamsDTO = {
      search: search as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      filters: {
        status: status as ClientContractQueryParamsDTO['filters']['status'],
      },
    };

    const result = await this._clientContractService.getAllContracts(clientId, query);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Contracts fetched successfully',
      data: result,
    });
  }

  async getContractDetail(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;

    const result = await this._clientContractService.getContractDetail(clientId, contractId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Contract detail fetched successfully',
      data: result,
    });
  }

  async cancelContract(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;
    const { cancelContractReason } = req.body;

    const result = await this._clientContractService.cancelContract(
      clientId,
      contractId,
      cancelContractReason,
    );

    res.status(HttpStatus.OK).json({ success: true, message: 'Contract cancelled', data: result });
  }

  async approveDeliverable(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;
    const data: ApproveDeliverableDTO = req.body;

    const result = await this._clientContractService.approveDeliverable(clientId, contractId, data);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Deliverable approved successfully',
      data: result,
    });
  }

  async requestDeliverableChanges(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;
    const data: RequestChangesDTO = req.body;

    const result = await this._clientContractService.requestDeliverableChanges(
      clientId,
      contractId,
      data,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Changes requested successfully',
      data: result,
    });
  }

  async approveMilestoneDeliverable(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;
    const data: ApproveMilestoneDeliverableDTO = req.body;

    const result = await this._clientContractService.approveMilestoneDeliverable(
      clientId,
      contractId,
      data,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Milestone deliverable approved successfully',
      data: result,
    });
  }

  async requestMilestoneChanges(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;
    const data: RequestMilestoneChangesDTO = req.body;

    const result = await this._clientContractService.requestMilestoneChanges(
      clientId,
      contractId,
      data,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Milestone changes requested successfully',
      data: result,
    });
  }

  async respondToMilestoneExtension(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;
    const data: RespondToExtensionDTO = req.body;

    const result = await this._clientContractService.respondToMilestoneExtension(
      clientId,
      contractId,
      data,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: `Extension request ${data.approved ? 'approved' : 'rejected'} successfully`,
      data: result,
    });
  }

  async getMilestoneDetail(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId, milestoneId } = req.params;
    const result = await this._clientContractService.getMilestoneDetail(
      clientId,
      contractId,
      milestoneId,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Milestone detail fetched successfully',
      data: result,
    });
  }

  async respondToContractExtension(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;
    const data: RespondToContractExtensionDTO = req.body;

    const result = await this._clientContractService.respondToContractExtension(
      clientId,
      contractId,
      data,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: `Contract extension request ${data.approved ? 'approved' : 'rejected'} successfully`,
      data: result,
    });
  }

  async downloadDeliverableFiles(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;
    const data: DownloadDeliverableDTO = req.body;

    const zipArchive = await this._clientContractService.downloadDeliverableFiles(
      clientId,
      contractId,
      data,
    );

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=deliverable-files.zip`);

    zipArchive.pipe(res);
  }

  async downloadMilestoneDeliverableFiles(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId, milestoneId } = req.params;
    const data: DownloadDeliverableDTO = req.body;

    const zipArchive = await this._clientContractService.downloadMilestoneDeliverableFiles(
      clientId,
      contractId,
      milestoneId,
      data,
    );

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=milestone-deliverable-files.zip`);

    zipArchive.pipe(res);
  }

  async activateHourlyContract(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;

    const result = await this._clientContractService.activateHourlyContract(clientId, contractId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Hourly contract activated successfully',
      data: result,
    });
  }
  async endHourlyContract(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;
    const result = await this._clientContractService.endHourlyContract(clientId, contractId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: result.message,
      data: result,
    });
  }

  async createCancellationRequest(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;
    const data = req.body;

    const result = await this._clientContractService.createCancellationRequest(
      clientId,
      contractId,
      data,
    );

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Cancellation request created successfully',
      data: result,
    });
  }

  async getCancellationRequest(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;

    const result = await this._clientContractService.getCancellationRequest(clientId, contractId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Cancellation request fetched successfully',
      data: result,
    });
  }

  async acceptCancellationRequest(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;
    const data = req.body;

    const result = await this._clientContractService.acceptCancellationRequest(
      clientId,
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
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;
    const { notes } = req.body;

    const result = await this._clientContractService.raiseCancellationDispute(
      clientId,
      contractId,
      notes,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: result.message,
      data: result,
    });
  }

  async getContractTimeline(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;

    const result = await this._contractActivityService.getContractTimeline(contractId, clientId, 'client');

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Contract timeline fetched successfully',
      data: result,
    });
  }
}
