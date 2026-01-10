import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { ISpecialityWithSkill } from '../../models/interfaces/speciality.model.interface';
import { ISpecialityRepository } from '../../repositories/interfaces/speciality-repository.interface';
import { IFreelancerSpecialityService } from './interfaces/freelancer-speciality-service.interface';
import { GetFreelancerSpecialityWithSkillsDTO } from '../../dto/freelancerDTO/freelancer-speciality.dto';
import { mapSpecialityModelToGetFreelancerSpecialityWithSkillsDTO } from '../../mapper/freelancerMapper/freelancer-speciality.mapper';

@injectable()
export class FreelancerSpecialityService implements IFreelancerSpecialityService {
  private _specialityRepository: ISpecialityRepository;
  constructor(@inject('ISpecialityRepository') specialityRepository: ISpecialityRepository) {
    this._specialityRepository = specialityRepository;
  }

  async getSpecialityWithSkills(
    selectedCategory: string,
  ): Promise<GetFreelancerSpecialityWithSkillsDTO[]> {
    const specialitiesWithSkills: ISpecialityWithSkill[] | null =
      await this._specialityRepository.getAllSpecialitiesWithSkills(selectedCategory);

    const specialityDtos = specialitiesWithSkills
      ? specialitiesWithSkills.map(mapSpecialityModelToGetFreelancerSpecialityWithSkillsDTO)
      : [];

    return specialityDtos;
  }
}
