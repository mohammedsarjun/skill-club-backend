import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IAdminReviewController } from './interfaces/admin-review-controller.interface';
import { IAdminReviewService } from '../../services/interfaces/admin-review-service.interface';
import { HttpStatus } from '../../enums/http-status.enum';
import { AdminReviewQueryDTO } from '../../dto/adminDTO/admin-review.dto';

@injectable()
export class AdminReviewController implements IAdminReviewController {
  private _adminReviewService: IAdminReviewService;

  constructor(@inject('IAdminReviewService') adminReviewService: IAdminReviewService) {
    this._adminReviewService = adminReviewService;
  }

  async getReviews(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const reviewerRole = req.query.reviewerRole as 'client' | 'freelancer' | undefined;
    const isHideByAdmin = req.query.isHideByAdmin === 'true' ? true : req.query.isHideByAdmin === 'false' ? false : undefined;

    const query: AdminReviewQueryDTO = {
      page,
      limit,
      reviewerRole,
      isHideByAdmin,
    };

    const result = await this._adminReviewService.getReviews(query);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: result,
    });
  }

  async toggleHideReview(req: Request, res: Response): Promise<void> {
    const { reviewId } = req.params;

    const result = await this._adminReviewService.toggleHideReview(reviewId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Review visibility toggled successfully',
      data: result,
    });
  }
}
