import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import { MESSAGES } from '../../contants/contants';
import { IUserSkillController } from './interfaces/user-skill-controller.interface';
import type { IUserSkillServices } from '../../services/userServices/interfaces/user-skill-services.interface';
import { ResSkillDtoMinimal } from '../../dto/skill.dto';

@injectable()
export class UserSkillController implements IUserSkillController {
  private _userSkillService: IUserSkillServices;

  constructor(@inject('IUserSkillServices') userSkillService: IUserSkillServices) {
    this._userSkillService = userSkillService;
  }

  async getSuggestedSkills(req: Request, res: Response): Promise<void> {
    const { specialities } = req.query;
    const skills: ResSkillDtoMinimal[] | null = await this._userSkillService.getSuggestedSkills(
      specialities as string[],
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.SKILL.FETCH_SUCCESS,
      data: skills,
    });
  }
}
