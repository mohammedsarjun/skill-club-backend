import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IAdminContractController } from './interfaces/admin-contract-controller.interface';
import { IAdminContractService } from '../../services/adminServices/interfaces/admin-contract-service.interface';
import { IContractActivityService } from '../../services/commonServices/interfaces/contract-activity-service.interface';
import { HttpStatus } from '../../enums/http-status.enum';
import { MESSAGES } from '../../contants/contants';
import { AdminContractQueryParamsDTO } from '../../dto/adminDTO/admin-contract.dto';

@injectable()
export class AdminContractController implements IAdminContractController {
  private _adminContractService: IAdminContractService;
  private _contractActivityService: IContractActivityService;

  constructor(
    @inject('IAdminContractService')
    adminContractService: IAdminContractService,
    @inject('IContractActivityService')
    contractActivityService: IContractActivityService,
  ) {
    this._adminContractService = adminContractService;
    this._contractActivityService = contractActivityService;
  }

  async getContracts(req: Request, res: Response): Promise<void> {
    const query: AdminContractQueryParamsDTO = {
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      filters: {
        status: req.query.status as AdminContractQueryParamsDTO['filters']['status'],
      },
    };

    const result = await this._adminContractService.getAllContracts(query);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.CONTRACT.FETCH_SUCCESS,
      data: result,
    });
  }

  async getContractDetail(req: Request, res: Response): Promise<void> {
    const { contractId } = req.params;

    const contract = await this._adminContractService.getContractDetail(contractId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.CONTRACT.FETCH_SUCCESS,
      data: contract,
    });
  }

  async getContractTimeline(req: Request, res: Response): Promise<void> {
    const { contractId } = req.params;

    const result = await this._contractActivityService.getAdminContractTimeline(contractId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.CONTRACT.TIMELINE_FETCHED,
      data: result,
    });
  }
}
