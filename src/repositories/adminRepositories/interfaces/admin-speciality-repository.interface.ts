import BaseRepository from '../../baseRepositories/base-repository';
import { ISpeciality } from '../../../models/interfaces/speciality.model.interface';
export interface IAdminSpecialityRepository extends BaseRepository<ISpeciality> {
  findAllWithFilters(
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
  ): Promise<ISpeciality[] | null>;

  countTotalSpecialities(): Promise<number>;
}
