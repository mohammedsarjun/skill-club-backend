import { injectable, inject } from 'tsyringe';
import '../../config/container';
// import AppError from '../../utils/app-error';
// import { HttpStatus } from '../../enums/http-status.enum';

import { ICategoryRepository } from '../../repositories/interfaces/category-repository.interface';
import { IFreelancerCategoryService } from './interfaces/freelancer-category-service.interface';
import { mapCategoryModelToGetFreelancerCategoryDTO } from '../../mapper/freelancerMapper/freelancer-category.mapper';
import { GetFreelancerCategoryDTO } from '../../dto/freelancerDTO/freelancer-category.dto';

@injectable()
export class FreelancerCategoryService implements IFreelancerCategoryService {
  private _categoryRepository: ICategoryRepository;
  constructor(@inject('ICategoryRepository') categoryRepository: ICategoryRepository) {
    this._categoryRepository = categoryRepository;
  }

  async getAllCategories(): Promise<GetFreelancerCategoryDTO[]> {
    const categories = await this._categoryRepository.getCategories();

    const categoryDTOs: GetFreelancerCategoryDTO[] =
      categories?.map(mapCategoryModelToGetFreelancerCategoryDTO) || [];

    return categoryDTOs;
  }
}
