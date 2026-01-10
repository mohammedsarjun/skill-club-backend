import { Types } from 'mongoose';
import { ISkill } from '../../models/interfaces/skill.model.interface';
import BaseRepository from '../baseRepositories/base-repository';

export interface ISkillRepository extends BaseRepository<ISkill> {
  getSuggestedSkills(specialities: Types.ObjectId[]): Promise<ISkill[] | null>;
  getListedSkillsByIds(Ids: Types.ObjectId[]): Promise<ISkill[] | null>;
}
