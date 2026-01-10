import { SpecialityDtoMinimal } from '../../../dto/speciality.dto';

export interface IUserSpecialityServices {
  getSpecialities(categoryId: string): Promise<SpecialityDtoMinimal[] | null>;
}
