import { FreelancerWithdrawalDetailDTO } from '../../../dto/freelancerDTO/freelancer-withdrawal.dto';

export interface IFreelancerFinanceService {
  requestWithdrawal(freelancerId: string, amount: number, note?: string): Promise<unknown>;
  getWithdrawalHistory(
    freelancerId: string,
    page: number,
    limit: number,
    status?: string,
  ): Promise<{ items: unknown[]; total: number; pages: number }>;
  getWithdrawalDetail(
    freelancerId: string,
    withdrawalId: string,
  ): Promise<FreelancerWithdrawalDetailDTO>;
}

export default IFreelancerFinanceService;
