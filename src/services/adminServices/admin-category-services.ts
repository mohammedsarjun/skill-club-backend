import { IAdminCategoryServices } from './interfaces/admin-category-services.interface';
import {
  CategoryDto,
  CategoryDtoMinimal,
  CategoryQueryParams,
  CreateCategoryDTO,
  PaginatedCategoryDto,
  UpdateCategoryDTO,
} from '../../dto/category.dto';
import type { IAdminCategoryRepository } from '../../repositories/adminRepositories/interfaces/admin-category-repository.interface';
import { injectable, inject } from 'tsyringe';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import {
  mapCategoryModelToCategoryDto,
  mapCategoryModelToCategoryDtoMinimal,
  mapCategoryQuery,
  mapCreateCategoryDtoToCategoryModel,
  mapUpdateCategoryDtoToCategoryModel,
} from '../../mapper/category.mapper';
import { ERROR_MESSAGES } from '../../contants/error-constants';

@injectable()
export class AdminCategoryServices implements IAdminCategoryServices {
  private _adminCategoryRepository;

  constructor(
    @inject('IAdminCategoryRepository')
    adminCategoryRepository: IAdminCategoryRepository,
  ) {
    this._adminCategoryRepository = adminCategoryRepository;
  }
  async addCategory(categoryData: CreateCategoryDTO): Promise<CategoryDto> {
    const categoryDto = mapCreateCategoryDtoToCategoryModel(categoryData);
    const existing = await this._adminCategoryRepository.findOne({
      name: categoryDto.name,
    });

    if (existing) {
      throw new AppError(ERROR_MESSAGES.CATEGORY.ALREADY_EXIST, HttpStatus.CONFLICT);
    }

    const result = await this._adminCategoryRepository.create(categoryDto);
    const resultDto = mapCategoryModelToCategoryDto(result);
    return resultDto;
  }

  async getCategory(filterData: CategoryQueryParams): Promise<PaginatedCategoryDto> {
    const filterDataDto = mapCategoryQuery(filterData);
    const page = filterDataDto.page ?? 1;
    const limit = filterDataDto.limit ?? 10;
    const skip = (page - 1) * limit;
    const mode = filterDataDto.mode;

    const result = await this._adminCategoryRepository.findAll(
      { name: { $regex: filterDataDto.search || '', $options: 'i' } },
      { skip, limit },
    );

    const total = await this._adminCategoryRepository.count();

    // Map to DTO
    let data: CategoryDto[] | CategoryDtoMinimal[];

    if (mode == 'detailed') {
      data = result.map(mapCategoryModelToCategoryDto);
    } else {
      data = result.map(mapCategoryModelToCategoryDtoMinimal);
    }

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async editCategory(data: Partial<UpdateCategoryDTO>, id: string): Promise<CategoryDto | null> {
    const updateData = mapUpdateCategoryDtoToCategoryModel(data);
    if (updateData.name) {
      const existing = await this._adminCategoryRepository.findOne({
        name: updateData.name,
      });
      if (existing) {
        throw new AppError(ERROR_MESSAGES.CATEGORY.ALREADY_EXIST, HttpStatus.CONFLICT);
      }
    }

    const result = await this._adminCategoryRepository.updateById(id, updateData);

    return result ? mapCategoryModelToCategoryDto(result) : result;
  }
}
