import { GetFreelancerSpecialityWithSkillsDTO } from '../../../dto/freelancerDTO/freelancer-speciality.dto';

export interface IFreelancerSpecialityService {
  getSpecialityWithSkills(
    selectedCategory: string,
  ): Promise<GetFreelancerSpecialityWithSkillsDTO[]>;
}
