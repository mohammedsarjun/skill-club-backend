import { injectable, inject } from 'tsyringe';
import { IAdminRevenueService } from './interfaces/admin-revenue-service.interface';
import {
  AdminRevenueResponseDto,
  GetRevenueQueryDto,
  RevenueStatsDto,
  RevenueChartDataPointDto,
  RevenueTransactionDto,
} from '../../dto/adminDTO/admin-revenue.dto';
import { IContractTransactionRepository } from '../../repositories/interfaces/contract-transaction-repository.interface';
import {
  mapToRevenueStatsDto,
  mapToRevenueChartDataPointDto,
  mapToRevenueTransactionDto,
} from '../../mapper/adminMapper/admin-revenue.mapper';

@injectable()
export class AdminRevenueService implements IAdminRevenueService {
  private _contractTransactionRepository: IContractTransactionRepository;

  constructor(
    @inject('IContractTransactionRepository')
    contractTransactionRepository: IContractTransactionRepository,
  ) {
    this._contractTransactionRepository = contractTransactionRepository;
  }

  async getRevenueData(query: GetRevenueQueryDto): Promise<AdminRevenueResponseDto> {
    const { period, startDate, endDate } = query;

    const dateRange = this.calculateDateRange(period, startDate, endDate);

    const stats = await this.getStats(dateRange.startDate, dateRange.endDate);
    const chartData = await this.getChartData();
    const transactions = await this.getTransactions(dateRange.startDate, dateRange.endDate);

    return {
      stats,
      chartData,
      categoryData: [],
      transactions,
    };
  }

  private async getStats(startDate?: Date, endDate?: Date): Promise<RevenueStatsDto> {
    const stats = await this._contractTransactionRepository.getRevenueStats(startDate, endDate);

    let growth = 0;
    if (startDate && endDate) {
      const previousRevenue = await this._contractTransactionRepository.getPreviousPeriodRevenue(
        startDate,
        endDate,
      );
      if (previousRevenue > 0) {
        growth = ((stats.totalRevenue - previousRevenue) / previousRevenue) * 100;
      } else if (stats.totalRevenue > 0) {
        growth = 100;
      }
    }

    return mapToRevenueStatsDto({
      totalRevenue: stats.totalRevenue,
      totalCommissions: stats.totalCommissions,
      totalTransactions: stats.totalTransactions,
      averageCommission: stats.averageCommission,
      growth: Number(growth.toFixed(1)),
    });
  }

  private async getChartData(): Promise<RevenueChartDataPointDto[]> {
    const chartData = await this._contractTransactionRepository.getRevenueChartData();
    return chartData.map((data) =>
      mapToRevenueChartDataPointDto(data.month, data.revenue, data.transactions),
    );
  }

  private async getTransactions(
    startDate?: Date,
    endDate?: Date,
  ): Promise<RevenueTransactionDto[]> {
    const transactions =
      await this._contractTransactionRepository.findCommissionTransactionsWithPagination(
        startDate,
        endDate,
      );
    return transactions.map((transaction) => mapToRevenueTransactionDto(transaction));
  }

  private calculateDateRange(
    period?: 'thisWeek' | 'thisMonth' | 'thisYear' | 'custom',
    customStartDate?: Date,
    customEndDate?: Date,
  ): { startDate?: Date; endDate?: Date } {
    if (period === 'custom' && customStartDate && customEndDate) {
      return { startDate: customStartDate, endDate: customEndDate };
    }

    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (period === 'thisWeek') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'thisMonth') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (period === 'thisYear') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    }

    return { startDate, endDate };
  }
}
