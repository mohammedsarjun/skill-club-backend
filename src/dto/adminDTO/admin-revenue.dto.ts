export interface RevenueStatsDto {
  totalRevenue: number;
  totalCommissions: number;
  totalTransactions: number;
  averageCommission: number;
  growth: number;
}

export interface RevenueChartDataPointDto {
  month: string;
  revenue: number;
  transactions: number;
}

export interface RevenueCategoryDataDto {
  name: string;
  value: number;
  percentage: number;
}

export interface RevenueTransactionClientFreelancerDto {
  id: string;
  name: string;
  email: string;
}

export interface RevenueTransactionDto {
  id: string;
  transactionId: string;
  contractId: string;
  clientId: RevenueTransactionClientFreelancerDto;
  freelancerId: RevenueTransactionClientFreelancerDto;
  amount: number;
  purpose: string;
  status: string;
  description: string;
  createdAt: Date;
  metadata?: {
    projectName?: string;
    category?: string;
  };
}

export interface AdminRevenueResponseDto {
  stats: RevenueStatsDto;
  chartData: RevenueChartDataPointDto[];
  categoryData: RevenueCategoryDataDto[];
  transactions: RevenueTransactionDto[];
}

export interface GetRevenueQueryDto {
  period?: 'thisWeek' | 'thisMonth' | 'thisYear' | 'custom';
  startDate?: Date;
  endDate?: Date;
}
