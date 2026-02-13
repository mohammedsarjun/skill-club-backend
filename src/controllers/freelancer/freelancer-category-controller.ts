import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';

import { MESSAGES } from '../../contants/contants';

import { IFreelancerCategoryController } from './interfaces/freelancer-category-controller.interface';
import { IFreelancerCategoryService } from '../../services/freelancerServices/interfaces/freelancer-category-service.interface';
import { GetFreelancerCategoryDTO } from '../../dto/freelancerDTO/freelancer-category.dto';

@injectable()
export class FreelancerCategoryController implements IFreelancerCategoryController {
  private _freelancerCategoryService: IFreelancerCategoryService;
  constructor(
    @inject('IFreelancerCategoryService') freelancerCategoryService: IFreelancerCategoryService,
  ) {
    this._freelancerCategoryService = freelancerCategoryService;
  }

  async getAllCategories(_req: Request, res: Response): Promise<void> {
    const categoryData: GetFreelancerCategoryDTO[] =
      await this._freelancerCategoryService.getAllCategories();

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.CATEGORY.FETCH_SUCCESS,
      data: categoryData,
    });
  }
}
