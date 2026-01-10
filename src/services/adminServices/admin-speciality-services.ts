import { injectable, inject } from 'tsyringe';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import {
  CreateSpecialityDTO,
  GetSpecialityDto,
  PaginatedSpecialityDto,
  SpecialityDto,
  SpecialityEntity,
  UpdateSpecialityDTO,
} from '../../dto/speciality.dto';
import { IAdminSpecialityServices } from './interfaces/admin-speciality-services.interface';
import type { IAdminSpecialityRepository } from '../../repositories/adminRepositories/interfaces/admin-speciality-repository.interface';
import {
  mapCreateSpecialityDtoToSpecialityModel,
  mapSpecialityModelToSpecialityDto,
  mapUpdateSpecialityDtoToSpecialityModel,
} from '../../mapper/speciality.mapper';
import { ERROR_MESSAGES } from '../../contants/error-constants';

@injectable()
export class AdminSpecialityServices implements IAdminSpecialityServices {
  private _adminSpecialityRepository;

  constructor(
    @inject('IAdminSpecialityRepository')
    adminSpecialityRepository: IAdminSpecialityRepository,
  ) {
    this._adminSpecialityRepository = adminSpecialityRepository;
  }

  async addSpeciality(specialityData: CreateSpecialityDTO): Promise<SpecialityDto> {
    const specialityDataDto = mapCreateSpecialityDtoToSpecialityModel(specialityData);

    const existing = await this._adminSpecialityRepository.findOne({
      name: specialityDataDto.name,
    });

    if (existing) {
      throw new AppError(ERROR_MESSAGES.SPECIALITY.ALREADY_EXIST, HttpStatus.CONFLICT);
    }

    // Create speciality
    const created = await this._adminSpecialityRepository.create(specialityDataDto);

    // Fetch with category populated
    const populated = (await this._adminSpecialityRepository.findOne(
      { _id: created._id },
      { populate: { path: 'category', select: '_id name' } },
    )) as SpecialityEntity | null;

    if (!populated) {
      throw new AppError('Speciality not found after creation', HttpStatus.NOT_FOUND);
    }
    const result = mapSpecialityModelToSpecialityDto(populated);
    return result;
  }

  async getSpeciality(filterData: GetSpecialityDto): Promise<PaginatedSpecialityDto> {
    const page = filterData.page ?? 1;
    const limit = filterData.limit ?? 10;
    const skip = (page - 1) * limit;
    const result = (await this._adminSpecialityRepository.findAllWithFilters(
      {
        search: filterData.search, // just values
        category: filterData.categoryFilter, // just values
      },
      {
        skip,
        limit,
        populate: {
          path: 'category',
          select: '_id name',
        },
      },
    )) as SpecialityEntity[] | null;

    const total = await this._adminSpecialityRepository.countTotalSpecialities();

    // Map to DTO

    const data: SpecialityDto[] = result!.map(mapSpecialityModelToSpecialityDto);
    return {
      data,
      total,
      page,
      limit,
    };
  }

  // service
  async editSpeciality(specialityData: UpdateSpecialityDTO): Promise<SpecialityDto> {
    // Check for duplicate name
    if (specialityData?.name) {
      const existing = await this._adminSpecialityRepository.findOne({ name: specialityData.name });
      if (existing && existing._id.toString() !== specialityData.id) {
        throw new AppError(ERROR_MESSAGES.SPECIALITY.ALREADY_EXIST, HttpStatus.CONFLICT);
      }
    }

    // Map DTO to model and update
    const dto = mapUpdateSpecialityDtoToSpecialityModel(specialityData);
    await this._adminSpecialityRepository.updateById(specialityData.id, dto);

    // ✅ Fetch updated speciality with category populated
    const updatedSpeciality = (await this._adminSpecialityRepository.findOne(
      { _id: specialityData.id },
      { populate: { path: 'category', select: '_id name' } },
    )) as SpecialityEntity | null;

    if (!updatedSpeciality) {
      throw new AppError('Speciality not found after update', HttpStatus.NOT_FOUND);
    }

    const result = mapSpecialityModelToSpecialityDto(updatedSpeciality);

    return result;
  }
}
