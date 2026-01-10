import { injectable, inject } from 'tsyringe';
import { IUserSpecialityServices } from './interfaces/user-speciality-services.interface';
import type { ISpecialityRepository } from '../../repositories/interfaces/speciality-repository.interface';
import { SpecialityDtoMinimal } from '../../dto/speciality.dto';
import { mapSpecialityModelToSpecialityDtoMinimal } from '../../mapper/speciality.mapper';

@injectable()
export class userSpecialityServices implements IUserSpecialityServices {
  private _specialityRepository: ISpecialityRepository;
  constructor(@inject('ISpecialityRepository') specialityRepository: ISpecialityRepository) {
    this._specialityRepository = specialityRepository;
  }

  async getSpecialities(categoryId: string): Promise<SpecialityDtoMinimal[] | null> {
    const result = await this._specialityRepository.getSpeciality(categoryId);
    // Map to DTO

    const dtoData: SpecialityDtoMinimal[] | null = result
      ? result.map(mapSpecialityModelToSpecialityDtoMinimal)
      : null;

    return dtoData;
  }
}
