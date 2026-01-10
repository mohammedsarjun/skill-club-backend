import BaseRepository from './baseRepositories/base-repository';

import { ICategoryRepository } from './interfaces/category-repository.interface';
import { categoryModel } from '../models/category.model';
import { ICategory } from '../models/interfaces/category.model.interface';

export class CategoryRepository extends BaseRepository<ICategory> implements ICategoryRepository {
  constructor() {
    super(categoryModel);
  }

  getCategories(): Promise<ICategory[] | null> {
    return super.findAll();
  }

  async getCategory(categoryId: string): Promise<ICategory | null> {
    return this.findById(categoryId);
  }
}
