import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import type { IAdminUserServices } from '../../services/adminServices/interfaces/admin-user-services.interface';
import { AdminUserStatsDto } from '../../dto/adminDTO/admin-users.dto';
import { MESSAGES } from '../../contants/contants';
import { IAdminWithdrawalController } from './interfaces/admin-withdrawal-controller.interface';

@injectable()
export class AdminWithdrawalController implements IAdminWithdrawalController {
  private _adminWithdrawalService: IAdminWithdrawalServices;
  constructor(@inject('IAdminWithdrawalServices') adminWithdrawalService: IAdminWithdrawalServices) {
    this._adminWithdrawalService = adminWithdrawalService;
  }

  async getWithdrawStats(req: Request, res: Response): Promise<void> {
      
  }

  async getWithdrawals(req: Request, res: Response): Promise<void> {
      
  }
}
