import { ICategory } from '../../models/interfaces/category.model.interface';
import { categoryModel } from '../../models/category.model';
import BaseRepository from '../baseRepositories/base-repository';
import { IAdminCategoryRepository } from './interfaces/admin-category-repository.interface';

export class AdminCategoryRepository
  extends BaseRepository<ICategory>
  implements IAdminCategoryRepository
{
  constructor() {
    super(categoryModel);
  }
}
