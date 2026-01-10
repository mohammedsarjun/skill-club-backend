import { ContractTransactionPurpose } from '../../models/interfaces/contract-transaction.model.interface';

export interface FreelancerTransactionsQueryDTO {
  page?: number;
  limit?: number;
  filters?: {
    period?: 'week' | 'month' | 'year';
    startDate?: Date;
    endDate?: Date;
  };
}

export interface FreelancerEarningsOverviewDTO {
  available: number;
  pending: number;
  totalEarnings: number;
}

export interface FreelancerTransactionItemDTO {
  id: string;
  transactionId: string;
  contractId: string;
  amount: number;
  purpose: ContractTransactionPurpose;
  description: string;
  createdAt: Date;
  clientName?: string;
}

export interface FreelancerTransactionsListResultDTO {
  items: FreelancerTransactionItemDTO[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}
