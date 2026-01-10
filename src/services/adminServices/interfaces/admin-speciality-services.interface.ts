import {
  CreateSpecialityDTO,
  SpecialityDto,
  UpdateSpecialityDTO,
} from '../../../dto/speciality.dto.js';
import { GetSpecialityDto } from '../../../dto/speciality.dto.js';
import { PaginatedSpecialityDto } from '../../../dto/speciality.dto.js';
export interface IAdminSpecialityServices {
  addSpeciality(specialityData: CreateSpecialityDTO): Promise<SpecialityDto>;
  getSpeciality(filterData: GetSpecialityDto): Promise<PaginatedSpecialityDto>;
  editSpeciality(specialityData: UpdateSpecialityDTO): Promise<SpecialityDto>;

  // Legacy signatures removed — prefer typed methods above.
}
