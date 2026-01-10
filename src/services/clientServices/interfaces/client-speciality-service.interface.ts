import { GetClientSpecialityWithSkillsDTO } from '../../../dto/clientDTO/client-speciality.dto';

export interface IClientSpecialityService {
  getSpecialityWithSkills(selectedCategory: string): Promise<GetClientSpecialityWithSkillsDTO[]>;
}
