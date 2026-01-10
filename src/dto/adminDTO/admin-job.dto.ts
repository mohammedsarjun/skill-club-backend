// dto/jobResponse.dto.ts
export interface AdminJobResponseDTO {
  jobId: string;
  jobTitle: string;
  companyName: string;
  category: {
    categoryName: string;
    categoryId: string;
  };
  budget: {
    rateType: string;
    min: number;
    max: number;
  };
  totalProposal: number;
  status: string;
}

export interface AdminJobDetailResponseDTO {
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  category: {
    categoryName: string;
    categoryId: string;
  };
  specialities: {
    specialityId: string;
    specialityName: string;
  }[];
  skills: {
    skillId: string;
    skillName: string;
  }[];
  budget: {
    rateType: 'hourly' | 'fixed';
    min: number;
    max: number;
    hoursPerWeek?: number;
    estimatedDuration?: '1 To 3 Months' | '3 To 6 Months';
  };
  totalProposal: number;
  status: 'pending_verification' | 'rejected' | 'open' | 'closed' | 'archived' | 'suspended';
  clientDetail: {
    clientId: string;
    companyName: string;
    companyLogo: string;
  };
  verifiedBy?: string;
  rejectedReason?: string;
}

export interface PaginatedAdminJobDto {
  data: AdminJobResponseDTO[];
  total: number;
  page: number;
  limit: number;
}
