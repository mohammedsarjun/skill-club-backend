export interface AdminUserStatsDto {
  totalUsers: number;
  totalFreelancers: number;
  totalClients: number;
}

export interface UserQuery {
  search: string;
  page: number;
  limit: number;
  filters: {
    role?: 'client' | 'freelancer' | undefined;
    status?: string;
  };
}

export interface GetUserDto {
  search?: string;
  page?: number;
  limit?: number;
  filters?: { role: 'client' | 'freelancer' | undefined; status: string };
}

export interface AdminUserDto {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface FreelancerDetailDto {
  freelancerLogo: string;
  professionalRole: string;
  hourlyRate: string;
  languages: string[];
}

export interface ClientDetailDto {
  companyName: string;
  companyLogo: string;
  website: string;
  companyDescription: string;
}

export interface UserDetailDto {
  id: string;
  name: string;
  email: string;
  phone: number;
  roles: string[];
  isFreelancerBlocked: boolean;
  isClientBlocked: boolean;
  freelancerDetail: FreelancerDetailDto | undefined;
  clientDetail: ClientDetailDto | undefined;
}

export interface updateUserStatusDto {
  id: string;
  status: 'block' | 'unblock';
  role: 'client' | 'freelancer';
}
