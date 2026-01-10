import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import { IAdminUserController } from './interfaces/admin-user-controller.interface';
import type { IAdminUserServices } from '../../services/adminServices/interfaces/admin-user-services.interface';
import { AdminUserStatsDto } from '../../dto/adminDTO/admin-users.dto';

import { MESSAGES } from '../../contants/contants';

@injectable()
export class AdminUserController implements IAdminUserController {
  private _adminUserService: IAdminUserServices;
  constructor(@inject('IAdminUserServices') adminUserService: IAdminUserServices) {
    this._adminUserService = adminUserService;
  }

  async getUserStats(_req: Request, res: Response): Promise<void> {
    const result: AdminUserStatsDto = await this._adminUserService.getUserStats();
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.USER.FETCH_STATS_SUCCESS,
      data: result,
    });
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    const requestData = req.query;

    const result = await this._adminUserService.getUsers(requestData);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.USER.FETCH_SUCCESS,
      data: result,
    });
  }

  async getUserDetail(req: Request, res: Response): Promise<void> {
    const { id } = req.query;

    const result = await this._adminUserService.getUserDetail(id as string);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.USER.FETCH_SUCCESS,
      data: result,
    });
  }

  async updateUserStatus(req: Request, res: Response): Promise<void> {
    const result = await this._adminUserService.updateUserStatus(req.body);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.USER.UPDATED,
      data: result,
    });
  }
}
