import { Request, Response } from 'express';
export interface IUserSkillController {
  getSuggestedSkills(req: Request, res: Response): Promise<void>;
}
