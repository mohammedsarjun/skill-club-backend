import BaseRepository from '../baseRepositories/base-repository';
import { IBankDetails } from '../../models/interfaces/bank-details.model.interface';

export interface IBankDetailsRepository extends BaseRepository<IBankDetails> {
  findByUserId(userId: string): Promise<IBankDetails | null>;
  createOrUpdateByUser(userId: string, data: Partial<IBankDetails>): Promise<IBankDetails>;
}
