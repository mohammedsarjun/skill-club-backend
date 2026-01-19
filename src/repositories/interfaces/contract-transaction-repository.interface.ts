import BaseRepository from '../baseRepositories/base-repository';
import { IContractTransaction } from '../../models/interfaces/contract-transaction.model.interface';
import { ClientSession } from 'mongoose';

export interface IContractTransactionRepository extends BaseRepository<IContractTransaction> {
  createTransaction(data: Partial<IContractTransaction>, session?: ClientSession): Promise<IContractTransaction>;
  findByContractId(contractId: string): Promise<IContractTransaction[]>;
  findByMilestoneId(contractId: string, milestoneId: string): Promise<IContractTransaction[]>;
  findByClientId(clientId: string): Promise<IContractTransaction[]>;
  findSpentTransactionsByClientId(clientId: string): Promise<IContractTransaction[]>;
  findRefundTransactionsByClientId(clientId: string): Promise<IContractTransaction[]>;
  findTotalFundedAmountForFixedContract(contractId: string): Promise<number>;
  findByFreelancerIdWithPagination(
    freelancerId: string,
    page: number,
    limit: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<IContractTransaction[]>;
  countByFreelancerId(freelancerId: string, startDate?: Date, endDate?: Date): Promise<number>;
  findPendingEarningsByFreelancerId(freelancerId: string): Promise<number>;
  getRevenueByPeriod(
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'month' | 'year',
  ): Promise<{ date: Date; revenue: number }[]>;
  getMonthlyRevenue(year: number, month: number): Promise<number>;
  findTotalFundedAmountForMilestone(contractId: string, milestoneId: string): Promise<number>;
  findHoldTransactionByContract(contractId: string, milestoneId?: string): Promise<IContractTransaction | null>;
}
