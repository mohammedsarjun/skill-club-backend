//Request Dto

import { Types } from 'mongoose';

export interface CreateSpecialityDTO {
  name: string;
  category: Types.ObjectId;
  status: string;
}

export interface UpdateSpecialityDTO {
  id: string;
  name?: string;
  category?: Types.ObjectId;
  status?: string;
}

export interface GetSpecialityDto {
  search?: string;
  page?: number;
  limit?: number;
  categoryFilter?: string;
  mode?: string;
}

export interface SpecialityQueryParams {
  search?: string;
  page?: string;
  limit?: string;
  mode?: string;
  filter?: {
    category?: string;
  };
}

//Response Dto
export interface SpecialityDto {
  id: string;
  name: string;
  category: string;
  categoryName: string;
  status: string;
}

export interface SpecialityDtoMinimal {
  id: string;
  name: string;
}

export interface PaginatedSpecialityDto {
  data: SpecialityDto[];
  total: number;
  page: number;
  limit: number;
}

export interface SpecialityEntity {
  _id: string | Types.ObjectId;
  name: string;
  category?: {
    _id: string | Types.ObjectId;
    name: string;
  };
  status: string;
}
