import { injectable, inject } from 'tsyringe';
import { IAdminDashboardServices } from './interfaces/admin-dashboard-services.interface';
import {
  AdminDashboardStatsDto,
  AdminDashboardRevenueDto,
  AdminDashboardUserGrowthDto,
  RevenueDataPoint,
  UserGrowthDataPoint,
  RecentContractDto,
  RecentReviewDto,
} from '../../dto/adminDTO/admin-dashboard.dto';
import type { IUserRepository } from '../../repositories/interfaces/user-repository.interface';
import type { IJobRepository } from '../../repositories/interfaces/job-repository.interface';
import type { IContractTransactionRepository } from '../../repositories/interfaces/contract-transaction-repository.interface';
import type { IContractRepository } from '../../repositories/interfaces/contract-repository.interface';
import type { IReviewRepository } from '../../repositories/interfaces/review-repository.interface';
import {
  mapToDashboardStatsDto,
  mapToRevenueDataPoint,
  mapToUserGrowthDataPoint,
  mapToRecentContractDto,
  mapToRecentReviewDto,
} from '../../mapper/adminMapper/admin-dashboard.mapper';

@injectable()
export class AdminDashboardServices implements IAdminDashboardServices {
  private _userRepository: IUserRepository;
  private _jobRepository: IJobRepository;
  private _contractTransactionRepository: IContractTransactionRepository;
  private _contractRepository: IContractRepository;
  private _reviewRepository: IReviewRepository;

  constructor(
    @inject('IUserRepository') userRepository: IUserRepository,
    @inject('IJobRepository') jobRepository: IJobRepository,
    @inject('IContractTransactionRepository')
    contractTransactionRepository: IContractTransactionRepository,
    @inject('IContractRepository') contractRepository: IContractRepository,
    @inject('IReviewRepository') reviewRepository: IReviewRepository,
  ) {
    this._userRepository = userRepository;
    this._jobRepository = jobRepository;
    this._contractTransactionRepository = contractTransactionRepository;
    this._contractRepository = contractRepository;
    this._reviewRepository = reviewRepository;
  }

  async getDashboardStats(): Promise<AdminDashboardStatsDto> {
    const totalFreelancers = await this._userRepository.count({ roles: 'freelancer' });
    const totalClients = await this._userRepository.count({ roles: 'client' });
    const activeJobs = await this._jobRepository.countActiveJobs();

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const monthlyRevenue = await this._contractTransactionRepository.getMonthlyRevenue(
      currentYear,
      currentMonth,
    );

    return mapToDashboardStatsDto({
      totalFreelancers,
      totalClients,
      activeJobs,
      monthlyRevenue,
    });
  }

  async getRevenueData(year?: number): Promise<AdminDashboardRevenueDto> {
    const currentYear = year || new Date().getFullYear();

    const weeklyData = await this.getWeeklyRevenue();
    const monthlyData = await this.getMonthlyRevenue(currentYear);
    const yearlyData = await this.getYearlyRevenue();

    return {
      weekly: weeklyData,
      monthly: monthlyData,
      yearly: yearlyData,
    };
  }

  async getUserGrowthData(year?: number): Promise<AdminDashboardUserGrowthDto> {
    const currentYear = year || new Date().getFullYear();

    const weeklyData = await this.getWeeklyUserGrowth();
    const monthlyData = await this.getMonthlyUserGrowth(currentYear);
    const yearlyData = await this.getYearlyUserGrowth();

    return {
      weekly: weeklyData,
      monthly: monthlyData,
      yearly: yearlyData,
    };
  }

  private async getWeeklyRevenue(): Promise<RevenueDataPoint[]> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const revenueData = await this._contractTransactionRepository.getRevenueByPeriod(
      startOfWeek,
      endOfWeek,
      'day',
    );

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData: RevenueDataPoint[] = [];

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      const dayString = currentDay.toISOString().split('T')[0];

      const dayRevenue =
        revenueData.find((d) => d.date.toISOString().split('T')[0] === dayString)?.revenue || 0;

      weekData.push(mapToRevenueDataPoint(daysOfWeek[currentDay.getDay()], dayRevenue));
    }

    return weekData;
  }

  private async getMonthlyRevenue(year: number): Promise<RevenueDataPoint[]> {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const revenueData = await this._contractTransactionRepository.getRevenueByPeriod(
      startOfYear,
      endOfYear,
      'month',
    );

    const monthlyData: RevenueDataPoint[] = [];
    for (let i = 0; i < 12; i++) {
      const monthString = `${year}-${String(i + 1).padStart(2, '0')}`;
      const monthRevenue =
        revenueData.find((d) => {
          const dataMonth = `${d.date.getFullYear()}-${String(d.date.getMonth() + 1).padStart(2, '0')}`;
          return dataMonth === monthString;
        })?.revenue || 0;

      monthlyData.push(mapToRevenueDataPoint(monthNames[i], monthRevenue));
    }

    return monthlyData;
  }

  private async getYearlyRevenue(): Promise<RevenueDataPoint[]> {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 4;
    const startOfPeriod = new Date(startYear, 0, 1);
    const endOfPeriod = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const revenueData = await this._contractTransactionRepository.getRevenueByPeriod(
      startOfPeriod,
      endOfPeriod,
      'year',
    );

    const yearlyData: RevenueDataPoint[] = [];
    for (let i = startYear; i <= currentYear; i++) {
      const yearRevenue = revenueData.find((d) => d.date.getFullYear() === i)?.revenue || 0;

      yearlyData.push(mapToRevenueDataPoint(String(i), yearRevenue));
    }

    return yearlyData;
  }

  private async getWeeklyUserGrowth(): Promise<UserGrowthDataPoint[]> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const growthData = await this._userRepository.getUserGrowthByPeriod(
      startOfWeek,
      endOfWeek,
      'day',
    );

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData: UserGrowthDataPoint[] = [];

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      const dayString = currentDay.toISOString().split('T')[0];

      const dayData = growthData.find((d) => d.date.toISOString().split('T')[0] === dayString);

      weekData.push(
        mapToUserGrowthDataPoint(
          daysOfWeek[currentDay.getDay()],
          dayData?.freelancers || 0,
          dayData?.clients || 0,
        ),
      );
    }

    return weekData;
  }

  private async getMonthlyUserGrowth(year: number): Promise<UserGrowthDataPoint[]> {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const growthData = await this._userRepository.getUserGrowthByPeriod(
      startOfYear,
      endOfYear,
      'month',
    );

    const monthlyData: UserGrowthDataPoint[] = [];
    for (let i = 0; i < 12; i++) {
      const monthString = `${year}-${String(i + 1).padStart(2, '0')}`;
      const monthData = growthData.find((d) => {
        const dataMonth = `${d.date.getFullYear()}-${String(d.date.getMonth() + 1).padStart(2, '0')}`;
        return dataMonth === monthString;
      });

      monthlyData.push(
        mapToUserGrowthDataPoint(
          monthNames[i],
          monthData?.freelancers || 0,
          monthData?.clients || 0,
        ),
      );
    }

    return monthlyData;
  }

  private async getYearlyUserGrowth(): Promise<UserGrowthDataPoint[]> {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 4;
    const startOfPeriod = new Date(startYear, 0, 1);
    const endOfPeriod = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const growthData = await this._userRepository.getUserGrowthByPeriod(
      startOfPeriod,
      endOfPeriod,
      'year',
    );

    const yearlyData: UserGrowthDataPoint[] = [];
    for (let i = startYear; i <= currentYear; i++) {
      const yearData = growthData.find((d) => d.date.getFullYear() === i);

      yearlyData.push(
        mapToUserGrowthDataPoint(String(i), yearData?.freelancers || 0, yearData?.clients || 0),
      );
    }

    return yearlyData;
  }

  async getRecentContracts(limit: number = 5): Promise<RecentContractDto[]> {
    const contracts = await this._contractRepository.getRecentContracts(limit);
    return contracts.map((c) =>
      mapToRecentContractDto(c as unknown as Parameters<typeof mapToRecentContractDto>[0]),
    );
  }

  async getRecentReviews(limit: number = 5): Promise<RecentReviewDto[]> {
    const reviews = await this._reviewRepository.getRecentReviews(limit);
    return reviews.map((r) =>
      mapToRecentReviewDto(r as unknown as Parameters<typeof mapToRecentReviewDto>[0]),
    );
  }
}
