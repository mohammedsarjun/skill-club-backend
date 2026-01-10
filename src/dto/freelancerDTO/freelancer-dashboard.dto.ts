export interface FreelancerDashboardStatsDto {
  totalFreelancers: number;
  totalClients: number;
  activeJobs: number;
  monthlyRevenue: number;
}

export interface FreelancerContractStatsDto {
  active: number;
  pending: number;
  completed: number;
}

export interface FreelancerEarningsDto {
  total: number;
  available: number;
  commission: number;
  pending: number;
}

export interface FreelancerMeetingDto {
  id: string;
  client: string;
  project: string;
  date: Date;
  time: string;
  status: string;
  channelName: string;
}

export interface FreelancerNotificationDto {
  id: string;
  type: string;
  message: string;
  time: string;
}

export interface FreelancerReviewDto {
  id: string;
  client: string;
  rating: number;
  comment: string;
  project: string;
  date: Date;
}

export interface FreelancerReviewStatsDto {
  average: number;
  total: number;
  recent: FreelancerReviewDto[];
}
