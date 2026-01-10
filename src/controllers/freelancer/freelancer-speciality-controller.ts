import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';

import { MESSAGES } from '../../contants/contants';

import { IFreelancerSpecialityController } from './interfaces/freelancer-speciality-controller.interface';
import { IFreelancerSpecialityService } from '../../services/freelancerServices/interfaces/freelancer-speciality-service.interface';
import { GetFreelancerSpecialityWithSkillsDTO } from '../../dto/freelancerDTO/freelancer-speciality.dto';

@injectable()
export class FreelancerSpecialityController implements IFreelancerSpecialityController {
  private _freelancerSpecialityService: IFreelancerSpecialityService;
  constructor(
    @inject('IFreelancerSpecialityService')
    freelancerSpecialityService: IFreelancerSpecialityService,
  ) {
    this._freelancerSpecialityService = freelancerSpecialityService;
  }

  async getSpecialityWithSkills(req: Request, res: Response): Promise<void> {
    const { selectedCategory } = req.query;
    const categoryData: GetFreelancerSpecialityWithSkillsDTO[] =
      await this._freelancerSpecialityService.getSpecialityWithSkills(selectedCategory as string);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.SPECIALITY.FETCH_SUCCESS,
      data: categoryData,
    });
  }
}
