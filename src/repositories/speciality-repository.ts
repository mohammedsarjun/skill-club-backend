import BaseRepository from './baseRepositories/base-repository';
import { ISpeciality, ISpecialityWithSkill } from '../models/interfaces/speciality.model.interface';
import { ISpecialityRepository } from './interfaces/speciality-repository.interface';
import { specialityModel } from '../models/speciality.model';
import { Types } from 'mongoose';

export class SpecialityRepository
  extends BaseRepository<ISpeciality>
  implements ISpecialityRepository
{
  constructor() {
    super(specialityModel);
  }

  getSpeciality(categoryId: string): Promise<ISpeciality[] | null> {
    return this.model.find({ category: categoryId });
  }
  // Fetch All Specialities with skills from speciality model
  async getAllSpecialitiesWithSkills(
    selectedCategory: string,
  ): Promise<ISpecialityWithSkill[] | null> {
    return await this.model.aggregate([
      { $match: { category: new Types.ObjectId(selectedCategory) } },
      {
        $lookup: {
          from: 'skills',
          localField: '_id',
          foreignField: 'specialities',
          as: 'skills',
        },
      },
      { $project: { _id: 1, name: 1, 'skills._id': 1, 'skills.name': 1 } },
    ]);
  }

  async getListedSpecialitiesByIds(Ids: Types.ObjectId[]): Promise<ISpeciality[] | null> {
    return this.findAll({ _id: { $in: Ids }, status: 'list' });
  }
}
