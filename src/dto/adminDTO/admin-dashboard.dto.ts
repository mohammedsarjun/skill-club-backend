export interface AdminDashboardStatsDto {
  totalFreelancers: number;
  totalClients: number;
  activeJobs: number;
  monthlyRevenue: number;
}

export interface RevenueDataPoint {
  name: string;
  revenue: number;
}

export interface UserGrowthDataPoint {
  name: string;
  freelancers: number;
  clients: number;
}

export interface AdminDashboardRevenueDto {
  weekly: RevenueDataPoint[];
  monthly: RevenueDataPoint[];
  yearly: RevenueDataPoint[];
}

export interface AdminDashboardUserGrowthDto {
  weekly: UserGrowthDataPoint[];
  monthly: UserGrowthDataPoint[];
  yearly: UserGrowthDataPoint[];
}

export interface GetDashboardStatsDto {
  year?: number;
}

export interface RecentContractDto {
  id: string;
  contractId: string;
  title: string;
  clientName: string;
  freelancerName: string;
  status: string;
  budget: number;
  createdAt: Date;
}

export interface RecentReviewDto {
  id: string;
  reviewerName: string;
  revieweeName: string;
  rating: number;
  comment: string;
  reviewerRole: string;
  createdAt: Date;
}
