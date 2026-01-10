import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IClientReviewController } from './interfaces/client-review-controller.interface';
import { IClientReviewService } from '../../services/clientServices/interfaces/client-review-service.interface';
import { HttpStatus } from '../../enums/http-status.enum';
import { SubmitReviewDTO } from '../../dto/clientDTO/client-review.dto';

@injectable()
export class ClientReviewController implements IClientReviewController {
  private _clientReviewService: IClientReviewService;

  constructor(@inject('IClientReviewService') clientReviewService: IClientReviewService) {
    this._clientReviewService = clientReviewService;
  }

  async submitReview(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;
    const data: SubmitReviewDTO = req.body;

    const result = await this._clientReviewService.submitReview(clientId, contractId, data);

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Review submitted successfully',
      data: result,
    });
  }

  async getReviewStatus(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;

    const result = await this._clientReviewService.getReviewStatus(clientId, contractId);

    res.status(HttpStatus.OK).json(result);
  }
}
