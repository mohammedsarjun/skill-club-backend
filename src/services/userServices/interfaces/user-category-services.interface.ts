import { CategoryDtoMinimal } from '../../../dto/category.dto';

export interface IUserCategoryServices {
  getAllCategories(): Promise<CategoryDtoMinimal[] | null>;
}
