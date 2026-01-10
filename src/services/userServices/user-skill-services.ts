import { injectable, inject } from 'tsyringe';
import { IUserSkillServices } from './interfaces/user-skill-services.interface';
import type { ISkillRepository } from '../../repositories/interfaces/skill-repository.interface';
import { ResSkillDtoMinimal } from '../../dto/skill.dto';
import { mapSkillModelToSpecialityDtoMinimal } from '../../mapper/skill.mapper';
import { Types } from 'mongoose';

@injectable()
export class UserSkillServices implements IUserSkillServices {
  private _skillRepository: ISkillRepository;
  constructor(@inject('ISkillRepository') skillRepository: ISkillRepository) {
    this._skillRepository = skillRepository;
  }

  async getSuggestedSkills(specialities: string[]): Promise<ResSkillDtoMinimal[] | null> {
    let dto = specialities.map((spec) => new Types.ObjectId(spec));
    const result = await this._skillRepository.getSuggestedSkills(dto);
    // Map to DTO
    const dtoData: ResSkillDtoMinimal[] | null = result
      ? result.map(mapSkillModelToSpecialityDtoMinimal)
      : null;

    return dtoData;
  }
}
