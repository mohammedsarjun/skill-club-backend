import { IOtp } from '../../models/interfaces/otp.model.interface';
import BaseRepository from '../baseRepositories/base-repository';
export interface IOtpRepository extends BaseRepository<IOtp> {
  findByEmail(email: string): Promise<IOtp | null>;
  deleteByEmail(email: string): Promise<IOtp | null>;
}
