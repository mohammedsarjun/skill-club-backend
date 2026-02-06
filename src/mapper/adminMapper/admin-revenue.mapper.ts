import {
  RevenueStatsDto,
  RevenueChartDataPointDto,
  RevenueCategoryDataDto,
  RevenueTransactionDto,
  RevenueTransactionClientFreelancerDto,
} from '../../dto/adminDTO/admin-revenue.dto';
import { IContractTransaction } from '../../models/interfaces/contract-transaction.model.interface';

export const mapToRevenueStatsDto = (data: {
  totalRevenue: number;
  totalCommissions: number;
  totalTransactions: number;
  averageCommission: number;
  growth: number;
}): RevenueStatsDto => {
  return {
    totalRevenue: data.totalRevenue,
    totalCommissions: data.totalCommissions,
    totalTransactions: data.totalTransactions,
    averageCommission: data.averageCommission,
    growth: data.growth,
  };
};

export const mapToRevenueChartDataPointDto = (
  month: string,
  revenue: number,
  transactions: number,
): RevenueChartDataPointDto => {
  return {
    month,
    revenue,
    transactions,
  };
};

export const mapToRevenueCategoryDataDto = (
  name: string,
  value: number,
  percentage: number,
): RevenueCategoryDataDto => {
  return {
    name,
    value,
    percentage,
  };
};

export const mapToRevenueTransactionDto = (
  transaction: IContractTransaction,
): RevenueTransactionDto => {
  const client = transaction.clientId as unknown as {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  const freelancer = transaction.freelancerId as unknown as {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  const clientDto: RevenueTransactionClientFreelancerDto = {
    id: String(client._id),
    name: `${client.firstName} ${client.lastName}`,
    email: client.email,
  };

  const freelancerDto: RevenueTransactionClientFreelancerDto = {
    id: String(freelancer._id),
    name: `${freelancer.firstName} ${freelancer.lastName}`,
    email: freelancer.email,
  };

  return {
    id: String(transaction._id),
    transactionId: transaction.transactionId,
    contractId: String(transaction.contractId),
    clientId: clientDto,
    freelancerId: freelancerDto,
    amount: transaction.amount,
    purpose: transaction.purpose,
    status: transaction.status,
    description: transaction.description,
    createdAt: transaction.createdAt || new Date(),
    metadata: transaction.metadata as {
      projectName?: string;
      category?: string;
    },
  };
};
