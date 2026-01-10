import { Types } from 'mongoose';
import {
  CreateSkillDTO,
  GetSkillDto,
  SkillDto,
  UpdateSkillDTO,
} from '../../dto/adminDTO/skill.dto';
import { ISkill } from '../../models/interfaces/skill.model.interface';

export const mapCreateSkillDtoToSkillModel = (
  dto: Omit<CreateSkillDTO, 'specialities'>,
): CreateSkillDTO => {
  console.log;
  return {
    name: dto.name,
    specialities: dto?.specialties?.map((id) => new Types.ObjectId(id))!,
    status: dto.status,
  };
};

export const mapSkillModelToSkillDto = (
  dto: Omit<ISkill, 'specialities'> & {
    specialities: { _id: string; name: string }[];
  },
): SkillDto => {
  return {
    id: dto._id.toString(),
    name: dto.name,
    specialities: dto.specialities.map((spec) => ({
      specialityId: spec._id.toString(),
      specialityName: spec.name,
    })),
    status: dto.status,
  };
};

export const mapSkillModelToAddSkillDto = (
  dto: Omit<ISkill, 'specialities'> & {
    specialities: { _id: string; name: string }[];
  },
): SkillDto => {
  return {
    id: dto._id.toString(),
    name: dto.name,
    specialities: dto.specialities.map((spec) => ({
      specialityId: spec._id.toString(),
      specialityName: spec.name,
    })),
    status: dto.status,
  };
};

export function mapSkillQuery(dto: GetSkillDto): GetSkillDto {
  return {
    search: dto.search || '',
    page: dto.page ? Number(dto.page) : 1,
    limit: dto.limit ? Number(dto.limit) : 10,
    mode: dto.mode,
  };
}

export const mapUpdateSkillDtoToSkillModel = (
  dto: Partial<UpdateSkillDTO>, // <- make it partial
): Partial<Pick<ISkill, 'name' | 'specialities' | 'status'>> => {
  const updatedData: Partial<Pick<ISkill, 'name' | 'specialities' | 'status'>> = {};

  if (dto.name !== undefined) updatedData.name = dto.name;
  if (dto.specialties !== undefined) updatedData.specialities = dto.specialties;
  if (dto.status !== undefined) updatedData.status = dto.status;

  return updatedData;
};
