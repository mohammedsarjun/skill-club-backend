export interface IFreelancerFinanceService {
  requestWithdrawal(freelancerId: string, amount: number, note?: string): Promise<any>;
  getWithdrawalHistory(freelancerId: string, page: number, limit: number, status?: string): Promise<{ items: any[]; total: number }>;
}

export default IFreelancerFinanceService;
