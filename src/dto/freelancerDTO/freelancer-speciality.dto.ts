interface Skill {
  skillId: string;
  skillName: string;
}

export interface GetFreelancerSpecialityWithSkillsDTO {
  specialityId: string;
  specialityName: string;
  skills: Skill[];
}
