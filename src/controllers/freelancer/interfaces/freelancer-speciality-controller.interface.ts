import { Request, Response } from 'express';

export interface IFreelancerSpecialityController {
  getSpecialityWithSkills(req: Request, res: Response): Promise<void>;
}
