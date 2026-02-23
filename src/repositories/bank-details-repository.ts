import { injectable } from 'tsyringe';
import BaseRepository from './baseRepositories/base-repository';
import { IBankDetails } from '../models/interfaces/bank-details.model.interface';
import { BankDetails } from '../models/bank-details.model';
import { IBankDetailsRepository } from './interfaces/bank-details-repository.interface';
import { Types } from 'mongoose';

@injectable()
export class BankDetailsRepository
  extends BaseRepository<IBankDetails>
  implements IBankDetailsRepository
{
  constructor() {
    super(BankDetails);
  }

  async findByUserId(userId: string): Promise<IBankDetails | null> {
    return (await this.model.findOne({ userId: new Types.ObjectId(userId) }).lean()) as unknown as IBankDetails | null;
  }

  async createOrUpdateByUser(userId: string, data: Partial<IBankDetails>): Promise<IBankDetails> {
    return await this.model.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: data },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}
