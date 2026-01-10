import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IClientCategoryService } from './interfaces/client-category-service.interface';
import { GetClientCategoryDTO } from '../../dto/clientDTO/client-category.dto';
import { mapCategoryModelToGetClientCategoryDTO } from '../../mapper/clientMapper/client-category.mapper';
import { ICategoryRepository } from '../../repositories/interfaces/category-repository.interface';

@injectable()
export class ClientCategoryService implements IClientCategoryService {
  private _categoryRepository: ICategoryRepository;
  constructor(@inject('ICategoryRepository') categoryRepository: ICategoryRepository) {
    this._categoryRepository = categoryRepository;
  }

  async getAllCategories(): Promise<GetClientCategoryDTO[]> {
    const categories = await this._categoryRepository.getCategories();

    const categoryDTOs: GetClientCategoryDTO[] =
      categories?.map(mapCategoryModelToGetClientCategoryDTO) || [];

    return categoryDTOs;
  }
}
