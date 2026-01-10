import { ResSkillDtoMinimal } from '../../../dto/skill.dto';

export interface IUserSkillServices {
  getSuggestedSkills(specialities: string[]): Promise<ResSkillDtoMinimal[] | null>;
}
