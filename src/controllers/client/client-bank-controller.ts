import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import { MESSAGES } from '../../contants/contants';
import { IClientBankController } from './interfaces/client-bank-controller.interface';
import { IClientBankService } from '../../services/clientServices/interfaces/client-bank-service.interface';

@injectable()
export class ClientBankController implements IClientBankController {
  private _clientBankService: IClientBankService;

  constructor(@inject('IClientBankService') clientBankService: IClientBankService) {
    this._clientBankService = clientBankService;
  }

  async getBankDetails(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId;
    const data = await this._clientBankService.getBankDetails(clientId!);
    res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.USER.BANK_DETAILS_FETCHED, data });
  }

  async saveBankDetails(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId;
    const payload = req.body;
    const data = await this._clientBankService.saveBankDetails(clientId!, payload);
    res.status(HttpStatus.OK).json({ success: true, message: MESSAGES.USER.BANK_DETAILS_SAVED, data });
  }
}
