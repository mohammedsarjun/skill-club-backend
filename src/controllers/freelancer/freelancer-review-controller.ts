import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IFreelancerReviewController } from './interfaces/freelancer-review-controller.interface';
import { IFreelancerReviewService } from '../../services/interfaces/freelancer-review-service.interface';
import { HttpStatus } from '../../enums/http-status.enum';
import { SubmitReviewDTO } from '../../dto/freelancerDTO/freelancer-review.dto';
import { FreelancerReviewListQueryDTO } from '../../dto/freelancerDTO/freelancer-review-list.dto';

@injectable()
export class FreelancerReviewController implements IFreelancerReviewController {
  private _freelancerReviewService: IFreelancerReviewService;

  constructor(@inject('IFreelancerReviewService') freelancerReviewService: IFreelancerReviewService) {
    this._freelancerReviewService = freelancerReviewService;
  }

  async submitReview(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;
    const data: SubmitReviewDTO = req.body;

    const result = await this._freelancerReviewService.submitReview(contractId, freelancerId, data);

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Review submitted successfully',
      data: result,
    });
  }

  async getReviewStatus(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;

    const result = await this._freelancerReviewService.getReviewStatus(contractId, freelancerId);

    res.status(HttpStatus.OK).json(result);
  }

  async getMyReviews(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const query: FreelancerReviewListQueryDTO = { page, limit };

    const result = await this._freelancerReviewService.getMyReviews(freelancerId, query);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: result,
    });
  }
}
