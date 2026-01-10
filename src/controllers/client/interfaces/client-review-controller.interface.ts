import { Request, Response } from 'express';

export interface IClientReviewController {
  submitReview(req: Request, res: Response): Promise<void>;
  getReviewStatus(req: Request, res: Response): Promise<void>;
}
