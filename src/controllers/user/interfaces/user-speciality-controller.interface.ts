import { Request, Response } from 'express';
export interface IUserSpecialityController {
  getSpecialities(req: Request, res: Response): Promise<void>;
}
