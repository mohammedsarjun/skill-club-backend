import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IAdminDisputeController } from './interfaces/admin-dispute-controller.interface';
import { IAdminDisputeService } from '../../services/adminServices/interfaces/admin-dispute-service.interface';
import { HttpStatus } from '../../enums/http-status.enum';
import { AdminDisputeQueryParamsDTO } from '../../dto/adminDTO/admin-dispute.dto';

@injectable()
export class AdminDisputeController implements IAdminDisputeController {
  private _adminDisputeService: IAdminDisputeService;

  constructor(
    @inject('IAdminDisputeService')
    adminDisputeService: IAdminDisputeService,
  ) {
    this._adminDisputeService = adminDisputeService;
  }

  async getDisputes(req: Request, res: Response): Promise<void> {
    const query: AdminDisputeQueryParamsDTO = {
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      filters: {
        reasonCode: req.query.reasonCode as string,
      },
    };

    const result = await this._adminDisputeService.getAllDisputes(query);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Disputes fetched successfully',
      data: result,
    });
  }

  async getDisputeById(req: Request, res: Response): Promise<void> {
    const { disputeId } = req.params;

    const result = await this._adminDisputeService.getDisputeById(disputeId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Dispute details fetched successfully',
      data: result,
    });
  }
}
