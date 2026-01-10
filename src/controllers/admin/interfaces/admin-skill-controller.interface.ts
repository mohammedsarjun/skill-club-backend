import { Request, Response } from 'express';

export interface IAdminSkillController {
  addSkill(req: Request, res: Response): Promise<void>;
  getSkills(req: Request, res: Response): Promise<void>;
  editSkill(req: Request, res: Response): Promise<void>;
}
