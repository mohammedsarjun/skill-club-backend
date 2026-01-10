import { Request, Response } from 'express';
export interface IUserCategoryController {
  getAllCategory(req: Request, res: Response): Promise<void>;
}
