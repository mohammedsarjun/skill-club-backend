import BaseRepository from '../baseRepositories/base-repository';
import { IFreelancerWallet } from '../../models/interfaces/freelancer-wallet.model.interface';
import { ClientSession } from 'mongoose';

export interface IFreelancerWalletRepository extends BaseRepository<IFreelancerWallet> {
  findByFreelancerId(freelancerId: string): Promise<IFreelancerWallet | null>;
  createWallet(freelancerId: string, session?: ClientSession): Promise<IFreelancerWallet>;
  updateBalance(freelancerId: string, amount: number, session?: ClientSession): Promise<IFreelancerWallet | null>;
  incrementTotalEarned(freelancerId: string, amount: number, session?: ClientSession): Promise<IFreelancerWallet | null>;
  incrementTotalCommissionPaid(freelancerId: string, amount: number, session?: ClientSession): Promise<IFreelancerWallet | null>;
  incrementTotalWithdrawn(freelancerId: string, amount: number, session?: ClientSession): Promise<IFreelancerWallet | null>;

}
