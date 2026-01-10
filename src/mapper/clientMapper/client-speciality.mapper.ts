import { GetClientSpecialityWithSkillsDTO } from '../../dto/clientDTO/client-speciality.dto';
import { ISpecialityWithSkill } from '../../models/interfaces/speciality.model.interface';

export const mapSpecialityModelToGetClientSpecialityWithSkillsDTO = (
  specialityData: ISpecialityWithSkill,
): GetClientSpecialityWithSkillsDTO => {
  return {
    specialityId: specialityData._id.toString(),
    specialityName: specialityData.name,
    skills: specialityData.skills.map((skill) => ({ skillId: skill._id, skillName: skill.name })),
  };
};
