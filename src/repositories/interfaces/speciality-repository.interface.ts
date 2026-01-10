import BaseRepository from '../baseRepositories/base-repository';
import {
  ISpeciality,
  ISpecialityWithSkill,
} from '../../models/interfaces/speciality.model.interface';
import { Types } from 'mongoose';

export interface ISpecialityRepository extends BaseRepository<ISpeciality> {
  getSpeciality(categoryId: string): Promise<ISpeciality[] | null>;
  getAllSpecialitiesWithSkills(selectedCategory: string): Promise<ISpecialityWithSkill[] | null>;
  getListedSpecialitiesByIds(Ids: Types.ObjectId[]): Promise<ISpeciality[] | null>;
}
