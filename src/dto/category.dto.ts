//Request Dto
export interface CreateCategoryDTO {
  name: string;
  description: string;
  status: string;
}

export interface UpdateCategoryDTO {
  id: string;
  name?: string;
  description?: string;
  status?: string;
}

export interface GetCategoryDto {
  search?: string;
  page?: number;
  limit?: number;
  mode?: string;
}

export interface CategoryQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  mode?: string;
}

//Response Dto
export interface CategoryDto {
  id: string;
  name: string;
  description: string;
  status: string;
}

export interface CategoryDtoMinimal {
  id: string;
  name: string;
}
export interface PaginatedCategoryDto {
  data: CategoryDto[] | CategoryDtoMinimal[];
  total: number;
  page: number;
  limit: number;
}
