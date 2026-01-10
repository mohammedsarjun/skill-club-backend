import { GetFreelancerCategoryDTO } from '../../../dto/freelancerDTO/freelancer-category.dto';

export interface IFreelancerCategoryService {
  getAllCategories(): Promise<GetFreelancerCategoryDTO[]>;
}
