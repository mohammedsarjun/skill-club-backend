import { Types } from 'mongoose';

export interface freelancerParams {
  search: string;
  minHourlyRate: number;
  maxHourlyRate: number;
  location: string;
  categoryId: string;
  specialityId: string;
  skillIds: string[];
  jobSuccessRate: number;
  languages: string[];
  page: number;
  limit: number;
}

export interface ClientFreelancerSkill {
  skillId: string;
  skillName: string;
}

export interface ClientFreelancerResponseDto {
  freelancerId: string;
  logo: string;
  freelancerName: string;
  professionalRole: string;
  country: string;
  hourlyRate: number;
  jobSuccessRate: number;
  totalEarnedAmount: number;
  categoryId: string;
  specialityIds: string[];
  skills: ClientFreelancerSkill[];
  bio: string;
  language: string[];
}

// DTO for sending freelancer profile data
export interface FetchClientFreelancerDTO {
  name: string;
  address: { country: string };
  logo?: string; // optional, as it can be undefined
  workCategory?: Types.ObjectId;
  specialties: { id: string; name: string }[];
  skills: { id: string; name: string }[];
  professionalRole: string;
  experiences: IClientFreelancerExperienceDTO[];
  education: IClientFreelancerEducationDTO[];
  languages: IClientFreelancerLanguageDTO[];
  bio: string;
  hourlyRate: number;
  portfolio: null;
}

// Experience DTO
export interface IClientFreelancerExperienceDTO {
  id?: string;
  title: string;
  company: string;
  location: string;
  country: string;
  isCurrentRole: boolean;
  startMonth: string;
  startYear: number;
  endMonth?: string | undefined;
  endYear?: number | undefined;
}

// Education DTO
export interface IClientFreelancerEducationDTO {
  id?: string;
  school: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number;
}

export interface IClientFreelancerLanguageDTO {
  name: string;
  proficiency: string;
}

// DTO for sending freelancer profile data
export interface FetchClientFreelancerPortfolioDTO {
  id: string;
  title: string;
  description: string;
  technologies: [string];
  role: string;
  projectUrl: string;
  githubUrl: string;
  images: [string];
  video: string;
}
