import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IAdminSkillController } from './interfaces/admin-skill-controller.interface';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import type { IAdminSkillServices } from '../../services/adminServices/interfaces/admin-skill-services.interface';
import { MESSAGES } from '../../contants/contants';
import { CreateSkillDTO, GetSkillDto, UpdateSkillDTO } from '../../dto/adminDTO/skill.dto';

@injectable()
export class AdminSkillController implements IAdminSkillController {
  private _adminSkillServices: IAdminSkillServices;

  constructor(
    @inject('IAdminSkillServices')
    adminSkillServices: IAdminSkillServices,
  ) {
    this._adminSkillServices = adminSkillServices;
  }

  async addSkill(req: Request, res: Response): Promise<void> {
    const skillDto: CreateSkillDTO = req.body;
    const result = await this._adminSkillServices.addSkill(skillDto);
    res.status(HttpStatus.CREATED).json({
      success: true,
      message: MESSAGES.SKILL.CREATED,
      data: result,
    });
  }

  async getSkills(req: Request, res: Response): Promise<void> {
    const skillDto: GetSkillDto = {
      search: typeof req.query.search === 'string' ? req.query.search : '',
      page: Number(req?.query?.page) || 1,
      limit: Number(req?.query?.limit) || 10,
      mode: typeof req.query.mode === 'string' ? req.query.mode : '',
    };

    const result = await this._adminSkillServices.getSkills(skillDto);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.SKILL.FETCH_SUCCESS,
      data: result,
    });
  }

  async editSkill(req: Request, res: Response): Promise<void> {
    const skillDto: Partial<UpdateSkillDTO> = req.body;
    const { id } = req.body;
    const result = await this._adminSkillServices.editSkill(id, skillDto);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.SKILL.UPDATED,
      data: result,
    });
  }
}
