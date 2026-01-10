import { GetClientCategoryDTO } from '../../dto/clientDTO/client-category.dto';
import { ICategory } from '../../models/interfaces/category.model.interface';

export const mapCategoryModelToGetClientCategoryDTO = (
  categoryData: ICategory,
): GetClientCategoryDTO => {
  return {
    categoryId: categoryData._id.toString(),
    categoryName: categoryData.name,
  };
};
