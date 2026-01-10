import { Request, Response } from 'express';

export interface IAdminReviewController {
  getReviews(req: Request, res: Response): Promise<void>;
  toggleHideReview(req: Request, res: Response): Promise<void>;
}
