import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import { MESSAGES } from '../../contants/contants';
import IClientSavedFreelancerService from '../../services/clientServices/interfaces/client-saved-freelancer-service.interface';

@injectable()
export class ClientSavedFreelancerController {
  private _clientSavedFreelancerService: IClientSavedFreelancerService;

  constructor(
    @inject('IClientSavedFreelancerService')
    clientSavedFreelancerService: IClientSavedFreelancerService,
  ) {
    this._clientSavedFreelancerService = clientSavedFreelancerService;
  }

  async toggleSaveFreelancer(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const freelancerId = req.params.freelancerId as string;
    const result = await this._clientSavedFreelancerService.toggleSaveFreelancer(
      clientId,
      freelancerId,
    );
    res.status(HttpStatus.OK).json({
      success: true,
      message: result.saved ? MESSAGES.SAVED_FREELANCER.SAVED : MESSAGES.SAVED_FREELANCER.UNSAVED,
      data: { saved: result.saved },
    });
  }

  async isFreelancerSaved(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const freelancerId = req.params.freelancerId as string;
    const saved = await this._clientSavedFreelancerService.isFreelancerSaved(
      clientId,
      freelancerId,
    );
    res.status(HttpStatus.OK).json({ success: true, data: { saved } });
  }

  async getSavedFreelancers(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { page, limit } = req.query as Record<string, string>;
    const result = await this._clientSavedFreelancerService.getSavedFreelancers(clientId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res
      .status(HttpStatus.OK)
      .json({ success: true, message: MESSAGES.SAVED_FREELANCER.FETCH_SUCCESS, data: result });
  }
}

export default ClientSavedFreelancerController;
