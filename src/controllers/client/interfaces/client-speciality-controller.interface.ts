import { Request, Response } from 'express';

export interface IClientSpecialityController {
  getSpecialityWithSkills(req: Request, res: Response): Promise<void>;
}
