import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import { IClientController } from './interfaces/client-controller.interface';
import type { IClientService } from '../../services/clientServices/interfaces/client-services.interface';
import { GetClientDTO } from '../../dto/clientDTO/client.dto';
import { mapUpdateClientDtoToClientModel } from '../../mapper/clientMapper/client.mapper';

@injectable()
export class ClientController implements IClientController {
  private _clientService: IClientService;
  constructor(@inject('IClientService') clientService: IClientService) {
    this._clientService = clientService;
  }

  async getClientData(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const result: GetClientDTO = await this._clientService.getClientData(userId!);
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Client Data Fetched Successfully',
      data: result,
    });
  }

  async updateClient(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const dto = mapUpdateClientDtoToClientModel(req.body);
    const result: GetClientDTO = await this._clientService.updateClient(userId!, dto);
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Client Data Updated Successfully',
      data: result,
    });
  }
}
