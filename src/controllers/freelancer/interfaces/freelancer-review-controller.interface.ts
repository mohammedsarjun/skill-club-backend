import { Request, Response } from 'express';

export interface IFreelancerReviewController {
  submitReview(req: Request, res: Response): Promise<void>;
  getReviewStatus(req: Request, res: Response): Promise<void>;
  getMyReviews(req: Request, res: Response): Promise<void>;
}
