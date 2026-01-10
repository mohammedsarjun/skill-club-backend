import {
  AdminDashboardStatsDto,
  RevenueDataPoint,
  UserGrowthDataPoint,
  RecentContractDto,
  RecentReviewDto,
} from '../../dto/adminDTO/admin-dashboard.dto';

export function mapToDashboardStatsDto(data: {
  totalFreelancers: number;
  totalClients: number;
  activeJobs: number;
  monthlyRevenue: number;
}): AdminDashboardStatsDto {
  return {
    totalFreelancers: data.totalFreelancers,
    totalClients: data.totalClients,
    activeJobs: data.activeJobs,
    monthlyRevenue: data.monthlyRevenue,
  };
}

export function mapToRevenueDataPoint(name: string, revenue: number): RevenueDataPoint {
  return {
    name,
    revenue,
  };
}

export function mapToUserGrowthDataPoint(
  name: string,
  freelancers: number,
  clients: number,
): UserGrowthDataPoint {
  return {
    name,
    freelancers,
    clients,
  };
}

export function mapToRecentContractDto(contract: any): RecentContractDto {
  return {
    id: contract._id.toString(),
    contractId: contract.contractId,
    title: contract.title,
    clientName: contract.clientId?.clientProfile?.companyName || 
                `${contract.clientId?.firstName || ''} ${contract.clientId?.lastName || ''}`.trim() || 'Unknown',
    freelancerName: `${contract.freelancerId?.firstName || ''} ${contract.freelancerId?.lastName || ''}`.trim() || 'Unknown',
    status: contract.status,
    budget: contract.budget,
    createdAt: contract.createdAt,
  };
}

export function mapToRecentReviewDto(review: any): RecentReviewDto {
  return {
    id: review._id.toString(),
    reviewerName: `${review.reviewerId?.firstName || ''} ${review.reviewerId?.lastName || ''}`.trim() || 'Unknown',
    revieweeName: `${review.revieweeId?.firstName || ''} ${review.revieweeId?.lastName || ''}`.trim() || 'Unknown',
    rating: review.rating,
    comment: review.comment,
    reviewerRole: review.reviewerRole,
    createdAt: review.createdAt,
  };
}
