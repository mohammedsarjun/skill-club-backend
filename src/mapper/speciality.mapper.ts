import {
  CreateSpecialityDTO,
  GetSpecialityDto,
  SpecialityDto,
  SpecialityDtoMinimal,
  SpecialityEntity,
  SpecialityQueryParams,
  UpdateSpecialityDTO,
} from '../dto/speciality.dto.js';
import { ISpeciality } from '../models/interfaces/speciality.model.interface.js';

export const mapCreateSpecialityDtoToSpecialityModel = (
  dto: CreateSpecialityDTO,
): Pick<ISpeciality, 'name' | 'category' | 'status'> => {
  return {
    name: dto.name,
    category: dto.category,
    status: dto.status,
  };
};

export const mapUpdateSpecialityDtoToSpecialityModel = (
  dto: Partial<UpdateSpecialityDTO>, // <- make it partial
): Partial<Pick<ISpeciality, 'name' | 'category' | 'status'>> => {
  const updatedData: Partial<Pick<ISpeciality, 'name' | 'category' | 'status'>> = {};

  if (dto.name !== undefined) updatedData.name = dto.name;
  if (dto.category !== undefined) updatedData.category = dto.category;
  if (dto.status !== undefined) updatedData.status = dto.status;

  return updatedData;
};

export function mapSpecialityQuery(dto: SpecialityQueryParams): GetSpecialityDto {
  return {
    search: dto.search || '',
    page: dto.page ? Number(dto.page) : 1,
    limit: dto.limit ? Number(dto.limit) : 10,
    categoryFilter: dto?.filter?.category ? dto.filter.category : undefined,
    mode: dto.mode,
  };
}

export const mapSpecialityModelToSpecialityDto = (speciality: SpecialityEntity): SpecialityDto => {
  return {
    id: speciality._id.toString(),
    name: speciality.name,
    category: speciality.category?._id?.toString() ?? speciality.category?.toString() ?? '',
    categoryName: speciality.category ? speciality.category.name : '',
    status: speciality.status,
  };
};

export const mapSpecialityModelToSpecialityDtoMinimal = (
  specaility: ISpeciality,
): SpecialityDtoMinimal => {
  return {
    id: specaility._id.toString(),
    name: specaility.name,
  };
};
