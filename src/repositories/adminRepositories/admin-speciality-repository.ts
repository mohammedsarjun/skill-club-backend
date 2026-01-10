import BaseRepository from '../baseRepositories/base-repository';
import { ISpeciality } from '../../models/interfaces/speciality.model.interface';
import { specialityModel } from '../../models/speciality.model';
import { IAdminSpecialityRepository } from './interfaces/admin-speciality-repository.interface';

export class AdminSpecialityRepository
  extends BaseRepository<ISpeciality>
  implements IAdminSpecialityRepository
{
  constructor() {
    super(specialityModel);
  }
  async findAllWithFilters(
    filters: { search?: string; category?: string },
    options: {
      skip?: number;
      limit?: number;
      populate?: {
        path: string;
        select?: string;
      };
      select?: string;
    },
  ): Promise<ISpeciality[] | null> {
    // Build query
    const query: { name?: { $regex: string; $options: string }; category?: string } = {};
    if (filters.search) {
      query.name = { $regex: filters.search, $options: 'i' };
    }

    if (filters.category) {
      query.category = filters.category;
    }

    // Start Mongoose query
    let mongooseQuery = this.model.find(query);

    // Apply skip / limit
    if (options.skip !== undefined) mongooseQuery = mongooseQuery.skip(options.skip);
    if (options.limit !== undefined) mongooseQuery = mongooseQuery.limit(options.limit);

    // Apply select (projection)
    if (options.select) mongooseQuery = mongooseQuery.select(options.select);

    // Apply populate
    if (options.populate) {
      mongooseQuery = mongooseQuery.populate(options.populate.path, options.populate.select);
    }

    // Execute query and assert type
    return (await mongooseQuery.exec()) as ISpeciality[];
  }

  async countTotalSpecialities(): Promise<number> {
    return super.count();
  }
}
