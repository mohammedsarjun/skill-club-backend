import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IClientSpecialityService } from './interfaces/client-speciality-service.interface';
import { GetClientSpecialityWithSkillsDTO } from '../../dto/clientDTO/client-speciality.dto';
import { mapSpecialityModelToGetClientSpecialityWithSkillsDTO } from '../../mapper/clientMapper/client-speciality.mapper';
import { ISpecialityWithSkill } from '../../models/interfaces/speciality.model.interface';
import { ISpecialityRepository } from '../../repositories/interfaces/speciality-repository.interface';

@injectable()
export class ClientSpecialityService implements IClientSpecialityService {
  private _specialityRepository: ISpecialityRepository;
  constructor(@inject('ISpecialityRepository') specialityRepository: ISpecialityRepository) {
    this._specialityRepository = specialityRepository;
  }

  async getSpecialityWithSkills(
    selectedCategory: string,
  ): Promise<GetClientSpecialityWithSkillsDTO[]> {
    const specialitiesWithSkills: ISpecialityWithSkill[] | null =
      await this._specialityRepository.getAllSpecialitiesWithSkills(selectedCategory);

    const specialityDtos = specialitiesWithSkills
      ? specialitiesWithSkills.map(mapSpecialityModelToGetClientSpecialityWithSkillsDTO)
      : [];

    return specialityDtos;
  }
}
