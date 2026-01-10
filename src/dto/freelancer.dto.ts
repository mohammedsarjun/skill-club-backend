import { Types } from 'mongoose';

// DTO for sending freelancer profile data
export interface GetFreelancerDTO {
  name: string;
  address: IAddress | undefined;
  logo?: string; // optional, as it can be undefined
  workCategory: string;
  specialties: string[];
  skills: string[];
  professionalRole: string;
  experiences: ExperienceDTO[];
  education: IEducationDTO[];
  languages: LanguageDTO[];
  bio: string;
  hourlyRate: number;
  portfolio: null;
}

// Experience DTO
export interface ExperienceDTO {
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
export interface EducationDTO {
  id?: string;
  school: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number;
}

export interface IAddress {
  country: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: number;
}

export interface LanguageDTO {
  name: string;

  proficiency: string;
}

export interface UpdateLanguageDTO {
  name: string;
  proficiency: string;
}

export interface UpdateExperienceDTO {
  title: string;
  company: string;
  location: string;
  country: string;
  isCurrentRole: boolean;
  startMonth: string;
  startYear: number;
  endMonth?: string;
  endYear?: number;
}

export interface UpdateEducationDTO {
  school: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number;
  description: string;
}

export interface UpdateFreelancerProfileDTO {
  logo: string | undefined;
  workCategory: string;
  specialties: string[];
  skills: string[];
  professionalRole: string;
  experiences: UpdateExperienceDTO;
  education: UpdateEducationDTO;
  languages: UpdateLanguageDTO;
  bio: string;
  hourlyRate: number;
  portfolio: [];
}

export interface FreelancerRawDto {
  languages?: Array<{
    name?: string;
    proficiency?: string;
  }>;
  category?: string;
  specialties?: string[];
  skills?: Array<{ value: string; name: string }>;
  professionalRole?: string;
  educations?: FreelancerRawEducationDto[];
  bio?: string;
  hourlyRate?: number;
  logo?: string;
  experiences?:
    | Array<{
        title?: string;
        company?: string;
        location?: string;
        country?: string;
        startMonth?: string;
        startYear?: number;
        endMonth?: string;
        endYear?: number;
        currentRole?: boolean;
      }>
    | [];

  address?: {
    country?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: number;
  };
}
export interface IEducationDTO {
  school: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
}

// DTO for sending freelancer profile data
export interface FetchFreelancerDTO {
  name: string;
  address: IAddress | undefined;
  logo?: string; // optional, as it can be undefined
  workCategory: { _id: string | Types.ObjectId; name: string } | undefined;
  specialties: { _id: string; name: string }[];
  skills: { _id: string; name: string }[];
  professionalRole: string;
  experiences: ExperienceDTO[];
  education: EducationDTO[];
  languages: LanguageDTO[];
  bio: string;
  hourlyRate: number;
  portfolio: null;
}

export interface FreelancerRawEducationDto {
  id: string;
  school: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number;
}

interface PopulatedWorkCategory {
  _id: Types.ObjectId | string;
  name: string;
}

interface PopulatedSpecialty {
  _id: Types.ObjectId | string;
  name: string;
}

interface PopulatedSkill {
  _id: Types.ObjectId | string;
  name: string;
}

interface PopulatedFreelancerProfile {
  workCategory?: PopulatedWorkCategory;
  specialties?: PopulatedSpecialty[];
  skills?: PopulatedSkill[];
  logo?: string;
  professionalRole?: string;
  experiences?: ExperienceDTO[];
  education?: EducationDTO[];
  languages?: LanguageDTO[];
  bio?: string;
  hourlyRate?: number;
}

export interface PopulatedFreelancerUser {
  firstName?: string;
  lastName?: string;
  address?: string;
  freelancerProfile?: PopulatedFreelancerProfile;
}
