import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';

import { IClientSpecialityController } from './interfaces/client-speciality-controller.interface';
import { IClientSpecialityService } from '../../services/clientServices/interfaces/client-speciality-service.interface';
import { MESSAGES } from '../../contants/contants';
import { GetClientSpecialityWithSkillsDTO } from '../../dto/clientDTO/client-speciality.dto';
// import { GetClientSpecialityWithSkillsDTO } from 'src/dto/clientDTO/client-speciality-dto';

@injectable()
export class ClientSpecialityController implements IClientSpecialityController {
  private _clientSpecialityService: IClientSpecialityService;
  constructor(
    @inject('IClientSpecialityService') clientSpecialityService: IClientSpecialityService,
  ) {
    this._clientSpecialityService = clientSpecialityService;
  }

  async getSpecialityWithSkills(req: Request, res: Response): Promise<void> {
    const { selectedCategory } = req.query;
    const categoryData: GetClientSpecialityWithSkillsDTO[] =
      await this._clientSpecialityService.getSpecialityWithSkills(selectedCategory as string);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.SPECIALITY.FETCH_SUCCESS,
      data: categoryData,
    });
  }
}
