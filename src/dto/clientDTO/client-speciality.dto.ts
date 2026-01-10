// ✅ Define proper TypeScript types
interface Skill {
  skillId: string;
  skillName: string;
}

export interface GetClientSpecialityWithSkillsDTO {
  specialityId: string;
  specialityName: string;
  skills: Skill[];
}
