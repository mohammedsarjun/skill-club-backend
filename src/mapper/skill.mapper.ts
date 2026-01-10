import { ResSkillDtoMinimal } from '../dto/skill.dto';
import { ISkill } from '../models/interfaces/skill.model.interface';

export const mapSkillModelToSpecialityDtoMinimal = (skill: ISkill): ResSkillDtoMinimal => {
  return {
    value: skill._id.toString(),
    label: skill.name,
  };
};
