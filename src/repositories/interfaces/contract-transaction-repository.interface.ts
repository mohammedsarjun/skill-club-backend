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
  findHoldTransactionByWorklog(contractId: string, worklogId: string): Promise<IContractTransaction | null>;
  updateTransactionStatusForFixedContract(contractId: string, status: IContractTransaction['status']): Promise<void>;
  updateTransactionStatusForMilestoneContract(
    contractId: string,
    milestoneId: string,
    status: IContractTransaction['status'],
  ): Promise<void>;
  updateTransactionStatusForWorklog(
    workLogId: string,
    status: IContractTransaction['status'],
    session?: ClientSession,
  ): Promise<void>;
  updateTransactionStatusByWorklogId(
    workLogId: string,
    status: IContractTransaction['status'],
  ): Promise<void>;
  findActiveHoldTransactionsByWorklogIds(worklogIds: string[]): Promise<IContractTransaction[]>;
  releaseHoldTransactionsToContract(worklogIds: string): Promise<IContractTransaction | null> ;
  findHourlyContractRefundAmount(contractId: string): Promise<number>;
  findTotalFundedByContractId(contractId: string): Promise<number>;
  findTotalPaidToFreelancerByContractId(contractId: string): Promise<number>;
  findTotalCommissionByContractId(contractId: string): Promise<number>;
  findTotalHeldByContractId(contractId: string): Promise<number>;
  findTotalRefundByContractId(contractId: string): Promise<number>;
  findFinancialSummaryByContractId(contractId: string): Promise<{
    totalFunded: number;
    totalPaidToFreelancer: number;
    commissionPaid: number;
    totalHeld: number;
    totalRefund: number;
    availableContractBalance: number;
  }>;
  updateHoldTransactionStatusToSplit(
    transactionId: string,
    clientRefundAmount: number,
    freelancerReleaseAmount: number,
  ): Promise<void>;
  updateHoldTransactionStatusToReleased(transactionId: string): Promise<void>;
  getTotalFundedByClientId(clientId: string): Promise<number>;
  findTotalRefundByClientId(clientId: string): Promise<number>;
  findTotalWithdrawalByClientId(clientId: string): Promise<number>;
  findTotalWithdrawalByClientId(clientId: string): Promise<number>;
  findWithdrawalsByClientIdWithPagination(clientId: string, page: number, limit: number): Promise<IContractTransaction[]>;
  countWithdrawalsByClientId(clientId: string): Promise<number>;
}