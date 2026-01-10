import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IClientDisputeController } from './interfaces/client-dispute-controller.interface';
import { IClientDisputeService } from '../../services/clientServices/interfaces/client-dispute-service.interface';
import { HttpStatus } from '../../enums/http-status.enum';
import { CreateDisputeRequestDTO } from '../../dto/clientDTO/client-dispute.dto';

@injectable()
export class ClientDisputeController implements IClientDisputeController {
  private _clientDisputeService: IClientDisputeService;

  constructor(@inject('IClientDisputeService') clientDisputeService: IClientDisputeService) {
    this._clientDisputeService = clientDisputeService;
  }

  async createDispute(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const data: CreateDisputeRequestDTO = req.body;

    const result = await this._clientDisputeService.createDispute(clientId, data);

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Dispute created successfully',
      data: result,
    });
  }

  async getDisputeById(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { disputeId } = req.params;

    const result = await this._clientDisputeService.getDisputeById(clientId, disputeId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Dispute fetched successfully',
      data: result,
    });
  }

  async getDisputesByContract(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;

    const result = await this._clientDisputeService.getDisputesByContract(clientId, contractId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Disputes fetched successfully',
      data: result,
    });
  }

  async cancelContractWithDispute(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;
    const { reasonCode, description } = req.body;

    const result = await this._clientDisputeService.cancelContractWithDispute(
      clientId,
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
