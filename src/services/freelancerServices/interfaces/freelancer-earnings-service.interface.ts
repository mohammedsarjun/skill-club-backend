import {
  FreelancerEarningsOverviewDTO,
  FreelancerTransactionsQueryDTO,
  FreelancerTransactionsListResultDTO,
} from '../../../dto/freelancerDTO/freelancer-earnings.dto';

export interface IFreelancerEarningsService {
  getEarningsOverview(freelancerId: string): Promise<FreelancerEarningsOverviewDTO>;
  getTransactions(
    freelancerId: string,
    query: FreelancerTransactionsQueryDTO,
  ): Promise<FreelancerTransactionsListResultDTO>;
}
