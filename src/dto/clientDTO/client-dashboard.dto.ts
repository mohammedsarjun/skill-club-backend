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

export interface RecentActiveContractDTO {
  _id: string;
  title: string;
  freelancer: {
    _id: string;
    name: string;
    logo?: string;
    country?: string;
  };
  status: string;
  contractType: string;
  startDate: string;
  budget: number;
  currency?: string;
}

export interface SavedFreelancerDTO {
  _id: string;
  freelancer: {
    _id: string;
    name: string;
    logo?: string;
    professionalRole?: string;
    country?: string;
    hourlyRate?: number;
    skills: string[];
  };
  savedAt: string;
}

export interface ClientDashboardDTO {
  stats: ClientDashboardStatsDTO;
  recentJobs: RecentJobDTO[];
  recentMessages: RecentMessageDTO[];
  recentActiveContracts: RecentActiveContractDTO[];
  savedFreelancers: SavedFreelancerDTO[];
}
