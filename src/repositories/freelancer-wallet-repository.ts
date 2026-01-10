import { injectable } from 'tsyringe';
import BaseRepository from './baseRepositories/base-repository';
import { IFreelancerWallet } from '../models/interfaces/freelancer-wallet.model.interface';
import { FreelancerWallet } from '../models/freelancer-wallet.model';
import { IFreelancerWalletRepository } from './interfaces/freelancer-wallet-repository.interface';
import { ClientSession, Types } from 'mongoose';

@injectable()
export class FreelancerWalletRepository
  extends BaseRepository<IFreelancerWallet>
  implements IFreelancerWalletRepository
{
  constructor() {
    super(FreelancerWallet);
  }

  async findByFreelancerId(freelancerId: string): Promise<IFreelancerWallet | null> {
    return await super.findOne({ freelancerId: new Types.ObjectId(freelancerId) });
  }

  async createWallet(freelancerId: string, session?: ClientSession): Promise<IFreelancerWallet> {
    return await super.create(
      { freelancerId: new Types.ObjectId(freelancerId), balance: 0, totalEarned: 0, totalWithdrawn: 0, totalCommissionPaid: 0 } as Partial<IFreelancerWallet>,
      session
    );
  }

  async updateBalance(freelancerId: string, amount: number, session?: ClientSession): Promise<IFreelancerWallet | null> {
    return await super.update(
      { freelancerId: new Types.ObjectId(freelancerId) },
      { $inc: { balance: amount } },
      session
    );
  }

  async incrementTotalEarned(freelancerId: string, amount: number, session?: ClientSession): Promise<IFreelancerWallet | null> {
    return await super.update(
      { freelancerId: new Types.ObjectId(freelancerId) },
      { $inc: { totalEarned: amount } },
      session
    );
  }

  async incrementTotalCommissionPaid(freelancerId: string, amount: number, session?: ClientSession): Promise<IFreelancerWallet | null> {
    return await super.update(
      { freelancerId: new Types.ObjectId(freelancerId) },
      { $inc: { totalCommissionPaid: amount } },
      session
    );
  }

  async incrementTotalWithdrawn(freelancerId: string, amount: number, session?: ClientSession): Promise<IFreelancerWallet | null> {
    return await super.update(
      { freelancerId: new Types.ObjectId(freelancerId) },
      { $inc: { totalWithdrawn: amount } },
      session
    );
  }
}
