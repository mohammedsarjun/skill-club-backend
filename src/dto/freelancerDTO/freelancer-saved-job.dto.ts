export interface FreelancerSavedJobsQueryDTO {
  page?: number;
  limit?: number;
}

export interface FreelancerSavedJobListItemDTO {
  id: string; // saved-job document id
  jobId: string;
  title: string;
  description: string;
  category?: string | null;
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
  client: { companyName?: string; country?: string; rating: number };
  status: string;
  postedAt: string; // job createdAt
  savedAt: string; // saved-job createdAt
}

export interface FreelancerSavedJobListResultDTO {
  items: FreelancerSavedJobListItemDTO[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}
