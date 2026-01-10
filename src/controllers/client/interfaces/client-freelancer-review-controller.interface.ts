import { Request, Response } from 'express';

export interface IClientFreelancerReviewController {
  getFreelancerReviews(req: Request, res: Response): Promise<void>;
}
