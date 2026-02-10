import { IContractTransaction } from '../../models/interfaces/contract-transaction.model.interface';
import { ClientTransactionDTO, ClientFinanceStatsDTO } from '../../dto/clientDTO/client-finance.dto';
import { Types } from 'mongoose';

const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
  return `${Math.floor(seconds / 2592000)} months ago`;
};

export const  mapTransactionToDTO = (
  transaction: IContractTransaction,
  freelancerName: string
): ClientTransactionDTO => {
  return {
    transactionId: transaction.transactionId,
    amount: transaction.amount,
    purpose: transaction.purpose,
    status: transaction.status,
    description: transaction.description,
    createdAt: formatTimeAgo(new Date(transaction.createdAt!)),
    freelancerName,
    contractId: (transaction.contractId as Types.ObjectId).toString(),
  };
};

export const mapFinanceStatsToDTO = (
  totalSpent: number,
  totalRefunded: number,
  availableBalance: number
): ClientFinanceStatsDTO => {
  return {
    totalSpent,
    totalRefunded,
    availableBalance,
  };
};
