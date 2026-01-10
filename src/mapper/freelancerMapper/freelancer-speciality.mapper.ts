import { GetFreelancerSpecialityWithSkillsDTO } from '../../dto/freelancerDTO/freelancer-speciality.dto';
import { ISpecialityWithSkill } from '../../models/interfaces/speciality.model.interface';

export const mapSpecialityModelToGetFreelancerSpecialityWithSkillsDTO = (
  specialityData: ISpecialityWithSkill,
): GetFreelancerSpecialityWithSkillsDTO => {
  return {
    specialityId: specialityData._id.toString(),
    specialityName: specialityData.name,
    skills: specialityData.skills.map((skill) => ({ skillId: skill._id, skillName: skill.name })),
  };
};
