import {
  CreateCategoryDTO,
  UpdateCategoryDTO,
  PaginatedCategoryDto,
  CategoryQueryParams,
  CategoryDto,
} from '../../../dto/category.dto.js';

export interface IAdminCategoryServices {
  addCategory(categoryData: CreateCategoryDTO): Promise<CategoryDto>;
  getCategory(filterData: CategoryQueryParams): Promise<PaginatedCategoryDto>;
  editCategory(data: Partial<UpdateCategoryDTO>, id: string): Promise<CategoryDto | null>;
}
