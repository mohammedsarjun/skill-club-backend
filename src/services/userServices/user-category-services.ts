import { injectable, inject } from 'tsyringe';
import { IUserCategoryServices } from './interfaces/user-category-services.interface';
import type { ICategoryRepository } from '../../repositories/interfaces/category-repository.interface';
import { CategoryDtoMinimal } from '../../dto/category.dto';
import { mapCategoryModelToCategoryDtoMinimal } from '../../mapper/category.mapper';

@injectable()
export class userCategoryServices implements IUserCategoryServices {
  private _categoryRepository: ICategoryRepository;
  constructor(@inject('ICategoryRepository') categoryRepository: ICategoryRepository) {
    this._categoryRepository = categoryRepository;
  }

  async getAllCategories(): Promise<CategoryDtoMinimal[] | null> {
    const result = await this._categoryRepository.getCategories();
    // Map to DTO

    const dtoData: CategoryDtoMinimal[] | null = result
      ? result.map(mapCategoryModelToCategoryDtoMinimal)
      : null;

    return dtoData;
  }
}
