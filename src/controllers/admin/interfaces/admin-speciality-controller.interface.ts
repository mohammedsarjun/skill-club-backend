import { Request, Response } from 'express';

export interface IAdminSpecialityController {
  addSpeciality(req: Request, res: Response): Promise<void>;
  editSpeciality(req: Request, res: Response): Promise<void>;
  getAllSpeciality(req: Request, res: Response): Promise<void>;
}
