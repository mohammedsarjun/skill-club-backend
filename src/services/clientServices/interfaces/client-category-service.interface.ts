import { GetClientCategoryDTO } from '../../../dto/clientDTO/client-category.dto';

export interface IClientCategoryService {
  getAllCategories(): Promise<GetClientCategoryDTO[]>;
}
