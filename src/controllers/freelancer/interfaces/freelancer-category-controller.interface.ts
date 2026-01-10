import { Request, Response } from 'express';

export interface IFreelancerCategoryController {
  getAllCategories(req: Request, res: Response): Promise<void>;
}
