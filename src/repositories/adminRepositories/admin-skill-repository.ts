import { CreateSkillDTO } from '../../dto/adminDTO/skill.dto';
import { ISkill } from '../../models/interfaces/skill.model.interface';
import { skillModel } from '../../models/skill.model';
import BaseRepository from '../baseRepositories/base-repository';
import { IAdminSkillRepository } from './interfaces/admin-skill-repository.interface';

export class AdminSkillRepository extends BaseRepository<ISkill> implements IAdminSkillRepository {
  constructor() {
    super(skillModel);
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
  ): Promise<ISkill[] | null> {
    // Build query
    const query: { name?: { $regex: string; $options: string }; category?: string } = {};

    if (filters.search) {
      query.name = { $regex: filters.search, $options: 'i' };
    }

    if (filters.category) {
      query.category = filters.category;
    }

    // Start Mongoose query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mongooseQuery: any = this.model.find(query);

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
    return (await mongooseQuery.exec()) as unknown as ISkill[];
  }

  async createSkill(skillData: CreateSkillDTO): Promise<ISkill | null> {
    return super.create(skillData);
  }

  async countAllSkills(): Promise<number> {
    return super.count();
  }
}
