import { IExperience, ILanguage, IUser } from '../models/interfaces/user.model.interface';
import {
  ExperienceDTO,
  EducationDTO,
  LanguageDTO,
  UpdateLanguageDTO,
  IEducationDTO,
  IAddress,
  FetchFreelancerDTO,
} from '../dto/freelancer.dto';

// Mapper function

interface FreelancerUser {
  firstName?: string;
  lastName?: string;
  address?: IAddress;
  freelancerProfile?: {
    logo?: string;
    workCategory?: { _id: string; name: string };
    specialties?: { _id: string; name: string }[];
    skills?: { _id: string; name: string }[];

    professionalRole?: string;
    experiences?: IExperience[];
    education?: FreelancerEducationDTO[];
    languages?: ILanguage[];
    bio?: string;
    hourlyRate?: number;
  };
}

export interface FreelancerEducationDTO {
  _id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
}

export const mapFreelancerToDTO = (user: Partial<FreelancerUser>): FetchFreelancerDTO => {
  return {
    name: `${user?.firstName} ${user?.lastName}`,
    address: user.address,
    logo: user?.freelancerProfile?.logo || '',
    workCategory: user?.freelancerProfile?.workCategory,
    specialties: user?.freelancerProfile?.specialties?.map((spec) => spec) || [],
    skills: user?.freelancerProfile?.skills?.map((skill) => skill) || [],
    professionalRole: user?.freelancerProfile?.professionalRole || '',
    experiences: user?.freelancerProfile?.experiences?.map(mapExperienceToDTO) || [],
    education: user?.freelancerProfile?.education?.map((edu) => mapEducationModelToDTO(edu)) || [],
    languages: user?.freelancerProfile?.languages?.map(mapLanguageToDTO) || [],
    bio: user?.freelancerProfile?.bio || '',
    hourlyRate: user?.freelancerProfile?.hourlyRate || 0,
    portfolio: null,
  };
};

// Experience mapper
const mapExperienceToDTO = (exp: IExperience): ExperienceDTO => {
  return {
    id: exp._id,
    title: exp.title,
    company: exp.company,
    location: exp.location,
    country: exp.country,
    isCurrentRole: exp.isCurrentRole,
    startMonth: exp.startMonth,
    startYear: exp.startYear,
    endMonth: exp.endMonth || undefined,
    endYear: exp.endYear || undefined,
  };
};

// Education mapper
export const mapEducationToDTO = (edu: EducationDTO): IEducationDTO => ({
  school: edu.school,
  degree: edu.degree,
  fieldOfStudy: edu.field,
  startYear: edu.startYear,
  endYear: edu.endYear,
});

// Language mapper
export const mapLanguageToDTO = (lang: ILanguage): LanguageDTO => ({
  name: lang.name,
  proficiency: lang.proficiency,
});

//response
export const mapUpdateLanguageToDTO = (user: IUser): UpdateLanguageDTO[] => {
  return user.freelancerProfile.languages;
};

export const mapUpdateWorkHistoryToDTO = (user: IUser): IExperience[] => {
  return user.freelancerProfile.experiences;
};

// request
export const mapUpdateLanguageDtoToLanguage = (lang: ILanguage): LanguageDTO => ({
  name: lang.name,
  proficiency: lang.proficiency,
});

export const mapEducationModelToDTO = (edu: FreelancerEducationDTO): EducationDTO => ({
  id: edu._id,
  school: edu.school,
  degree: edu.degree,
  field: edu.fieldOfStudy,
  startYear: edu.startYear,
  endYear: edu.endYear,
});

export const mapDtoToEducationModel = (edu: EducationDTO): IEducationDTO => ({
  school: edu.school,
  degree: edu.degree,
  fieldOfStudy: edu.field,
  startYear: edu.startYear,
  endYear: edu.endYear,
});
