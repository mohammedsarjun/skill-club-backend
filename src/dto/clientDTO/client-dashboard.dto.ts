export interface ClientDashboardStatsDTO {
  activeJobs: number;
  postedJobs: number;
  totalSpend: number;
  pendingProposals: number;
}

export interface RecentJobDTO {
  _id: string;
  title: string;
  budget: string;
  proposals: number;
  postedDate: string;
  status: string;
  rateType: string;
  currency?: string;
}

export interface RecentMessageDTO {
  _id: string;
  contractId: string;
  sender: {
    _id: string;
    name: string;
  };
  message: string;
  time: string;
  unread: boolean;
  avatar: string;
}

export interface ClientDashboardDTO {
  stats: ClientDashboardStatsDTO;
  recentJobs: RecentJobDTO[];
  recentMessages: RecentMessageDTO[];
}
