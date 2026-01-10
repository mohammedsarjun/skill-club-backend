export interface CreateJobDto {
  title: string;
  description: string;
  category: string;
  specialities: string[];
  skills: string[];
  rateType: 'hourly' | 'fixed';
  currency: 'USD' | 'EUR' | 'GBP' | 'INR' | 'AUD' | 'CAD' | 'SGD' | 'JPY';

  hourlyRate?: {
    min: number;
    max: number;
    hoursPerWeek: number;
    estimatedDuration: '1 To 3 Months' | '3 To 6 Months';
  };
  fixedRate?: {
    min: number;
    max: number;
  };

  clientId: string;
}

export interface UpdateJobDto {
  title: string;
  description: string;
  category: string;
  specialities: string[];
  skills: string[];
  rateType: 'hourly' | 'fixed';
  currency: 'USD' | 'EUR' | 'GBP' | 'INR' | 'AUD' | 'CAD' | 'SGD' | 'JPY';

  hourlyRate?: {
    min: number;
    max: number;
    hoursPerWeek: number;
    estimatedDuration: '1 To 3 Months' | '3 To 6 Months';
  };
  fixedRate?: {
    min: number;
    max: number;
  };
}

export interface ClientJobResponseDto {
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

export interface ClientJobDetailResponseDTO {
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
  suspendedReason?: string;
}

export interface PaginatedClientJobDto {
  data: ClientJobResponseDto[];
  total: number;
  page: number;
  limit: number;
}
