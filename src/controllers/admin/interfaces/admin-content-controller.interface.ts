import { Request, Response } from 'express';

export interface IAdminContentController {
  getAllContents(req: Request, res: Response): Promise<void>;
  getContentBySlug(req: Request, res: Response): Promise<void>;
  updateContent(req: Request, res: Response): Promise<void>;
  getPublishedContentBySlug(req: Request, res: Response): Promise<void>;
  getAllPublishedContents(req: Request, res: Response): Promise<void>;
}
