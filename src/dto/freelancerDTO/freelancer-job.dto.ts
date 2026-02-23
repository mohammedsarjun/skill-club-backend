export interface FreelancerJobFiltersDto {
  searchQuery: string;
  selectedCategory: string;
  selectedSpecialty: string;
  selectedSkills: string[];
  rateType: string;
  minHourlyRate: string;
  maxHourlyRate: string;
  minFixedRate: string;
  maxFixedRate: string;
  selectedProposalRanges: string[];
  selectedCountry: string;
  selectedRating: string;
  page: number;
  limit: number;
}


export interface FreelancerJobFiltersResponseDto {
  searchQuery: string;
  selectedCategory: string;
  selectedSpecialty: string;
  selectedSkills: string[];
  rateType: string;
  minHourlyRate: string;
  maxHourlyRate: string;
  minFixedRate: string;
  maxFixedRate: string;
  selectedProposalRanges: {
    proposalCount: { $gte: number, $lte: number }
  }[];
  selectedCountry: string;
  selectedRating: string;
  page: number;
  limit: number;
}


export interface FreelancerJobDetailResponseDto {
  jobId: string;
  title: string;
  description: string;
  category: string;
  specialities: string[];
  skills: string[];
  rateType: 'hourly' | 'fixed';
  hourlyRate?: {
    min: number;
    max: number;
    hoursPerWeek: number;
    estimatedDuration: '1 To 3 Months' | '3 To 6 Months';
  } | null;
  fixedRate?: {
    min: number;
    max: number;
  } | null;
  proposalReceived: number;
  postedAt: string; // ISO date string
  client: {
    companyName: string;
    country: string;
    rating: number;
    totalJobsPosted: number;
  };
  status: string;
  isProposalAlreadySent: boolean;
}

export interface FreelancerJobResponseDto {
  jobId: string;
  jobTitle: string;
  description: string;
  category: string;
  specialities: string[];
  skills: string[];
  jobRateType: 'hourly' | 'fixed';
  hourlyRate?: {
    min: number;
    max: number;
    hoursPerWeek?: number;
    estimatedDuration?: '1 To 3 Months' | '3 To 6 Months';
  } | null;
  fixedRate?: {
    min: number;
    max: number;
  } | null;
  totalProposalReceived: number;
  postedAt: string;
  client: {
    companyName: string;
    country: string;
    rating: number;
    totalMoneySpent: number;
  };
}
