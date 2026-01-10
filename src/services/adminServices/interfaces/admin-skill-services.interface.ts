import {
  CreateSkillDTO,
  GetSkillDto,
  SkillDto,
  UpdateSkillDTO,
} from '../../../dto/adminDTO/skill.dto.js';

export interface IAdminSkillServices {
  addSkill(skillData: CreateSkillDTO): Promise<SkillDto>;
  getSkills(filterData: GetSkillDto): Promise<{
    data: SkillDto[];
    total: number;
    page: number;
    limit: number;
  }>;
  editSkill(id: string, skillData: Partial<UpdateSkillDTO>): Promise<SkillDto>;
}
