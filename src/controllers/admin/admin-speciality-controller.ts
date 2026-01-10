import { Request, Response } from 'express';
import type { IAdminSpecialityController } from './interfaces/admin-speciality-controller.interface';
import { injectable, inject } from 'tsyringe';
import type { IAdminSpecialityServices } from '../../services/adminServices/interfaces/admin-speciality-services.interface';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import { MESSAGES } from '../../contants/contants';
import { ParsedQs } from 'qs';
import { CreateSpecialityDTO, GetSpecialityDto } from '../../dto/speciality.dto';

@injectable()
export class AdminSpecialityController implements IAdminSpecialityController {
  private _adminSpecialityService: IAdminSpecialityServices;

  constructor(
    @inject('IAdminSpecialityServices')
    adminSpecialityService: IAdminSpecialityServices,
  ) {
    this._adminSpecialityService = adminSpecialityService;
  }
  async addSpeciality(req: Request, res: Response): Promise<void> {
    const specialityDto: CreateSpecialityDTO = req.body;
    const result = await this._adminSpecialityService.addSpeciality(specialityDto);
    res.status(HttpStatus.CREATED).json({
      success: true,
      message: MESSAGES.SPECIALITY.CREATED,
      data: result,
    });
  }

  async editSpeciality(req: Request, res: Response): Promise<void> {
    const result = await this._adminSpecialityService.editSpeciality(req.body);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.SPECIALITY.UPDATED,
      data: result,
    });
  }

  async getAllSpeciality(req: Request, res: Response): Promise<void> {
    const filter = req.query?.filter as ParsedQs | undefined;
    const dto: GetSpecialityDto = {
      search: typeof req.query.search === 'string' ? req.query.search : '',
      page: Number(req?.query?.page) || 1,
      limit: Number(req?.query?.limit) || 10,
      categoryFilter: filter?.category ? String(filter?.category) : '',
      mode: typeof req.query.mode === 'string' ? req.query.mode : '',
    };

    const result = await this._adminSpecialityService.getSpeciality(dto);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.SPECIALITY.FETCH_SUCCESS,
      data: result,
    });
  }
}
