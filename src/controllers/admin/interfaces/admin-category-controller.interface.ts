import { Request, Response } from 'express';

export interface IAdminCategoryController {
  addCategory(req: Request, res: Response): Promise<void>;
  editCategory(req: Request, res: Response): Promise<void>;
  getAllCategory(req: Request, res: Response): Promise<void>;
}
