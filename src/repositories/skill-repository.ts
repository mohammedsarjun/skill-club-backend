import { Types } from 'mongoose';
import { ISkill } from '../models/interfaces/skill.model.interface';
import { skillModel } from '../models/skill.model';
import BaseRepository from './baseRepositories/base-repository';
import { ISkillRepository } from './interfaces/skill-repository.interface';

export class SkillRepository extends BaseRepository<ISkill> implements ISkillRepository {
  constructor() {
    super(skillModel);
  }
  getSuggestedSkills(specialities: Types.ObjectId[]): Promise<ISkill[] | null> {
    return this.findAll({ specialities: { $in: specialities } });
  }

  getListedSkillsByIds(Ids: Types.ObjectId[]): Promise<ISkill[] | null> {
    return this.findAll({ _id: { $in: Ids }, status: 'list' });
  }
}
