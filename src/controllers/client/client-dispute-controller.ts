import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IClientDisputeController } from './interfaces/client-dispute-controller.interface';
import { IClientDisputeService } from '../../services/clientServices/interfaces/client-dispute-service.interface';
import { HttpStatus } from '../../enums/http-status.enum';
import { MESSAGES } from '../../contants/contants';
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
      message: MESSAGES.DISPUTE.CREATED,
      data: result,
    });
  }

  async getDisputeById(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { disputeId } = req.params;

    const result = await this._clientDisputeService.getDisputeById(clientId, disputeId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.DISPUTE.FETCH_SUCCESS,
      data: result,
    });
  }

  async getDisputesByContract(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;

    const result = await this._clientDisputeService.getDisputesByContract(clientId, contractId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.DISPUTE.FETCH_ALL_SUCCESS,
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
      message: MESSAGES.DISPUTE.CONTRACT_CANCELLED_AND_CREATED,
      data: result,
    });
  }
}
