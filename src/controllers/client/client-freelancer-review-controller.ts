import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IClientFreelancerReviewController } from './interfaces/client-freelancer-review-controller.interface';
import { IClientFreelancerReviewService } from '../../services/clientServices/interfaces/client-freelancer-review-service.interface';
import { HttpStatus } from '../../enums/http-status.enum';
import { FreelancerReviewQueryDTO } from '../../dto/clientDTO/client-freelancer-review.dto';

@injectable()
export class ClientFreelancerReviewController implements IClientFreelancerReviewController {
  private _clientFreelancerReviewService: IClientFreelancerReviewService;

  constructor(
    @inject('IClientFreelancerReviewService')
    clientFreelancerReviewService: IClientFreelancerReviewService,
  ) {
    this._clientFreelancerReviewService = clientFreelancerReviewService;
  }

  async getFreelancerReviews(req: Request, res: Response): Promise<void> {
    const { freelancerId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const query: FreelancerReviewQueryDTO = {
      page,
      limit,
    };

    const result = await this._clientFreelancerReviewService.getFreelancerReviews(
      freelancerId,
      query,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Freelancer reviews fetched successfully',
      data: result,
    });
  }
}
