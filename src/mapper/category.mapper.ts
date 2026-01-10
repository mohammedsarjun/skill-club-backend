import {
  CreateCategoryDTO,
  CategoryDto,
  GetCategoryDto,
  UpdateCategoryDTO,
  CategoryDtoMinimal,
  CategoryQueryParams,
} from '../dto/category.dto.js';
import { ICategory } from '../models/interfaces/category.model.interface.js';

export const mapCreateCategoryDtoToCategoryModel = (
  dto: CreateCategoryDTO,
): Pick<ICategory, 'name' | 'description' | 'status'> => {
  return {
    name: dto.name,
    description: dto.description,
    status: dto.status,
  };
};

export const mapUpdateCategoryDtoToCategoryModel = (
  dto: Partial<UpdateCategoryDTO>, // <- make it partial
): Partial<Pick<ICategory, 'name' | 'description' | 'status'>> => {
  const updatedData: Partial<Pick<ICategory, 'name' | 'description' | 'status'>> = {};

  if (dto.name !== undefined) updatedData.name = dto.name;
  if (dto.description !== undefined) updatedData.description = dto.description;
  if (dto.status !== undefined) updatedData.status = dto.status;

  return updatedData;
};

export const mapCategoryModelToCategoryDto = (category: ICategory): CategoryDto => {
  return {
    id: category._id.toString(),
    name: category.name,
    description: category.description,
    status: category.status,
  };
};

export const mapCategoryModelToCategoryDtoMinimal = (category: ICategory): CategoryDtoMinimal => {
  return {
    id: category._id.toString(),
    name: category.name,
  };
};

export function mapCategoryQuery(dto: CategoryQueryParams): GetCategoryDto {
  return {
    search: dto.search || '',
    page: dto.page ? Number(dto.page) : 1,
    limit: dto.limit ? Number(dto.limit) : 10,
    mode: dto.mode,
  };
}
