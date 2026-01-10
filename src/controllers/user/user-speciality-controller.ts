import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import { MESSAGES } from '../../contants/contants';
import { IUserSpecialityController } from './interfaces/user-speciality-controller.interface';
import type { IUserSpecialityServices } from '../../services/userServices/interfaces/user-speciality-services.interface';
import { SpecialityDtoMinimal } from '../../dto/speciality.dto';

@injectable()
export class UserSpecialityController implements IUserSpecialityController {
  private _userSpecialityService: IUserSpecialityServices;

  constructor(@inject('IUserSpecialityServices') userSpecialityService: IUserSpecialityServices) {
    this._userSpecialityService = userSpecialityService;
  }

  async getSpecialities(req: Request, res: Response): Promise<void> {
    const { categoryId } = req.query;
    const specialities: SpecialityDtoMinimal[] | null =
      await this._userSpecialityService.getSpecialities(categoryId as string);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.SPECIALITY.FETCH_SUCCESS,
      data: specialities,
    });
  }
}
