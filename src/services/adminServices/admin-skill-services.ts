import { injectable, inject } from 'tsyringe';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { IAdminSkillServices } from './interfaces/admin-skill-services.interface';
import type { IAdminSkillRepository } from '../../repositories/adminRepositories/interfaces/admin-skill-repository.interface';
import {
  mapCreateSkillDtoToSkillModel,
  mapSkillModelToAddSkillDto,
  mapSkillModelToSkillDto,
  mapSkillQuery,
  mapUpdateSkillDtoToSkillModel,
} from '../../mapper/adminMapper/skill.mapper';
import {
  CreateSkillDTO,
  GetSkillDto,
  SkillDto,
  UpdateSkillDTO,
} from '../../dto/adminDTO/skill.dto';
import { ERROR_MESSAGES } from '../../contants/error-constants';

import { ISkillWithPopulatedSpecialities, PopulatedSkill } from '../../types/skill-type';
@injectable()
export class AdminSkillServices implements IAdminSkillServices {
  private _adminSkillRepository;

  constructor(
    @inject('IAdminSkillRepository')
    adminSkillRepository: IAdminSkillRepository,
  ) {
    this._adminSkillRepository = adminSkillRepository;
  }

  async addSkill(skillData: CreateSkillDTO): Promise<SkillDto> {
    const skillDataDto = mapCreateSkillDtoToSkillModel(skillData);
    const existing = await this._adminSkillRepository.findOne({
      name: skillDataDto.name,
    });

    if (existing) {
      throw new AppError('Skill with this name already exists', HttpStatus.CONFLICT);
    }

    // Create speciality
    const created = await this._adminSkillRepository.createSkill(skillDataDto);

    // Fetch with category populated
    const populated = await this._adminSkillRepository.findOne(
      { _id: created!._id },
      { populate: { path: 'specialities', select: '_id name' } },
    );

    if (!populated) {
      throw new AppError('Skills not found after creation', HttpStatus.NOT_FOUND);
    }

    const result = mapSkillModelToAddSkillDto(populated as unknown as PopulatedSkill);
    return result;
  }

  async getSkills(filterData: GetSkillDto): Promise<{
    data: SkillDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const filterDataDto = mapSkillQuery(filterData);
    const page = filterDataDto.page ?? 1;
    const limit = filterDataDto.limit ?? 10;
    const skip = (page - 1) * limit;

    const result = (await this._adminSkillRepository.findAllWithFilters(
      {
        search: filterDataDto.search, // just values
      },
      {
        skip,
        limit,
        populate: { path: 'specialities', select: '_id name' },
      },
    )) as ISkillWithPopulatedSpecialities[] | null;

    const total = await this._adminSkillRepository.countAllSkills();

    // Map to DTO

    const data: SkillDto[] = result!.map((result) =>
      mapSkillModelToSkillDto(result as ISkillWithPopulatedSpecialities),
    );

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async editSkill(id: string, skilldata: Partial<UpdateSkillDTO>): Promise<SkillDto> {
    // Check for duplicate name
    const skillDataDto = mapUpdateSkillDtoToSkillModel(skilldata);
    if (skillDataDto?.name) {
      const existing = await this._adminSkillRepository.findOne({ name: skillDataDto.name });
      if (existing && existing._id.toString() !== id) {
        throw new AppError(ERROR_MESSAGES.SKILL.ALREADY_EXIST, HttpStatus.CONFLICT);
      }
    }

    // Map DTO to model and update

    await this._adminSkillRepository.updateById(id, skillDataDto);

    // ✅ Fetch updated speciality with category populated
    const updatedSkill = (await this._adminSkillRepository.findOne(
      { _id: id },
      { populate: { path: 'specialities', select: '_id name' } },
    )) as ISkillWithPopulatedSpecialities | null;

    if (!updatedSkill) {
      throw new AppError('Skill not found after update', HttpStatus.NOT_FOUND);
    }

    const result = mapSkillModelToSkillDto(updatedSkill);

    return result;
  }
}
