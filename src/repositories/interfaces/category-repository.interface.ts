import BaseRepository from '../baseRepositories/base-repository';
import { ICategory } from '../../models/interfaces/category.model.interface';

export interface ICategoryRepository extends BaseRepository<ICategory> {
  getCategories(): Promise<ICategory[] | null>;
  getCategory(categoryId: string): Promise<ICategory | null>;
}
