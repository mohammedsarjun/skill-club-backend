import { Request, Response } from 'express';

export interface IClientCategoryController {
  getAllCategories(req: Request, res: Response): Promise<void>;
}
