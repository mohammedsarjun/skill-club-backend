export interface ClientFinanceStatsDTO {
  totalSpent: number;
  totalRefunded: number;
  availableBalance: number;
}

export interface ClientTransactionDTO {
  transactionId: string;
  amount: number;
  purpose: string;
  description: string;
  createdAt: string;
  freelancerName: string;
  contractId: string;
}

export interface ClientFinanceDTO {
  stats: ClientFinanceStatsDTO;
  spentTransactions: ClientTransactionDTO[];
  refundTransactions: ClientTransactionDTO[];
}
