export interface  UserStateDto{
  userId:string;
  activeRole:string;
}

export interface UserDto {
  userId: string;
  firstName: string;
  lastName: string;
  roles: string[];
  activeRole: string;
  isOnboardingCompleted: boolean;
  isFreelancerOnboarded: boolean;
  isClientOnboarded: boolean;
  clientProfile?: string | undefined;
  freelancerProfile?: string | undefined;
  isFreelancerBlocked: boolean;
  isClientBlocked: boolean;
}

export interface UserProfileDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: number;
  dob?: Date;
}

//Freelancer Profile Updatation DTO'S
export interface AddressDTO {
  country: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: number;
}

export interface LanguageDTO {
  name: string;
  proficiency: string;
  mandatory?: boolean;
}

export interface EducationDTO {
  school: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number;
}

export interface ExperienceDTO {
  title: string;
  company: string;
  location: string;
  country: string;
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  currentRole?: boolean;
}

export interface FreelancerDTO {
  category: string;
  specialties: string[];
  skills: string[];
  professionalRole: string;
  educations: EducationDTO[];
  languages: LanguageDTO[];
  bio: string;
  hourlyRate: number;
  logo: string;
  address: AddressDTO;
  experiences: ExperienceDTO[];
}

export interface RawExperience {
  title?: string;
  company?: string;
  location?: string;
  country?: string;
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  currentRole?: boolean;
}

export interface ClientProfileDetailDTO {
  companyName: string;
  logo?: string;
  description?: string;
  website?: string;
}

export interface ClientProfileDto {
  clientProfile: ClientProfileDetailDTO;
}

export interface ClientProfileUpdateResponseDto {
  companyName: string;
  logo?: string;
  description?: string;
  website?: string;
}

export interface EducationInfo {
  _id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
}
