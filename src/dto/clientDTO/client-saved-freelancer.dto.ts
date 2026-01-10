export interface ClientSavedFreelancerQueryDTO {
  page?: number;
  limit?: number;
}

export interface ClientSavedFreelancerListItemDTO {
  id: string; // saved doc id
  freelancerId: string;
  firstName?: string;
  lastName?: string;
  logo?: string;
  professionalRole?: string;
  country?: string;
  hourlyRate?: number;
  skills: string[];
  savedAt: string;
}

export interface ClientSavedFreelancerListResultDTO {
  items: ClientSavedFreelancerListItemDTO[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}
