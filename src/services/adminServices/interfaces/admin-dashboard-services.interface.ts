import {
  AdminDashboardStatsDto,
  AdminDashboardRevenueDto,
  AdminDashboardUserGrowthDto,
  RecentContractDto,
  RecentReviewDto,
} from '../../../dto/adminDTO/admin-dashboard.dto';

export interface IAdminDashboardServices {
  getDashboardStats(): Promise<AdminDashboardStatsDto>;
  getRevenueData(year?: number): Promise<AdminDashboardRevenueDto>;
  getUserGrowthData(year?: number): Promise<AdminDashboardUserGrowthDto>;
  getRecentContracts(limit?: number): Promise<RecentContractDto[]>;
  getRecentReviews(limit?: number): Promise<RecentReviewDto[]>;
}
