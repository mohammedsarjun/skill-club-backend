import { FreelancerRawDto, IAddress } from '../dto/freelancer.dto';
import {
  AddressDTO,
  ClientProfileDetailDTO,
  ClientProfileDto,
  ClientProfileUpdateResponseDto,
  EducationInfo,
  UserDto,
  UserProfileDto,
} from '../dto/user.dto';
import { IExperience, IUser } from '../models/interfaces/user.model.interface';
import { Types } from 'mongoose';

export const mapUserModelToUserDto = (modelData: IUser): UserDto => {
  return {
    userId: modelData._id.toString(),
    roles: modelData.roles,
    activeRole: modelData.activeRole,
    isOnboardingCompleted: modelData.isOnboardingCompleted,
    isFreelancerOnboarded: modelData.isFreelancerOnboarded ?? false,
    isClientOnboarded: modelData.isClientOnboarded ?? false,
    clientProfile: modelData?.clientProfile?.logo,
    freelancerProfile: modelData?.freelancerProfile?.logo,
    isClientBlocked: modelData?.isClientBlocked,
    isFreelancerBlocked: modelData?.isFreelancerBlocked,
  };
};

export const mapUserModelToUserProfileDto = (modelData: IUser): UserProfileDto => {
  return {
    firstName: modelData.firstName || '',
    lastName: modelData.lastName || '',
    email: modelData.email || '',
    phone: modelData.phone || 0,
    dob: modelData.dob || undefined,
  };
};

export function mapFreelancerDtoToUserModel(raw: FreelancerRawDto): Partial<IUser> {
  return {
    freelancerProfile: {
      languages: Array.isArray(raw.languages)
        ? raw.languages.map((lang) => ({
            name: lang.name || '',
            proficiency: lang.proficiency || '',
          }))
        : [],
      workCategory: new Types.ObjectId(raw.category) || '',
      specialties: Array.isArray(raw.specialties)
        ? raw.specialties.map((spec) => new Types.ObjectId(spec))
        : [],

      skills: Array.isArray(raw.skills)
        ? raw.skills.map(
            (skill: { value: string; name: string }) => new Types.ObjectId(skill.value),
          )
        : [],
      professionalRole: raw.professionalRole || '',

      education: Array.isArray(raw.educations)
        ? raw.educations.map(
            (edu): EducationInfo => ({
              _id: edu.id,
              school: edu.school || '',
              degree: edu.degree || '',
              fieldOfStudy: edu.field || '',
              startYear: edu.startYear || 0,
              endYear: edu.endYear,
            }),
          )
        : [],

      bio: raw.bio || '',
      hourlyRate: raw.hourlyRate || 0,
      logo: raw.logo || '',
      experiences: Array.isArray(raw.experiences)
        ? raw.experiences.map(
            (exp): IExperience => ({
              title: exp.title || '',
              company: exp.company || '',
              location: exp.location || '',
              country: exp.country || '',
              startMonth: exp.startMonth || '',
              startYear: exp.startYear || 0,
              endMonth: exp.endMonth || undefined,
              endYear: exp.endYear || undefined,
              isCurrentRole: exp.currentRole || false,
            }),
          )
        : [],
      portfolio: [],

      // export interface IExperience {
      //   title: string;
      //   company: string;
      //   location: string;
      //   country: string;
      //   isCurrentRole: boolean;
      //   startMonth: string;
      //   startYear: number;
      //   endMonth?: string;
      //   endYear?: number;
      // }
    },
    address: raw.address
      ? {
          country: raw.address.country || '',
          streetAddress: raw.address.streetAddress || '',
          city: raw.address.city || '',
          state: raw.address.state || '',
          zipCode: raw.address.zipCode || 0,
        }
      : { country: '', streetAddress: '', city: '', state: '', zipCode: 0 },
  };
}

export function mapClientDtoToUserModel(raw: ClientProfileDetailDTO): ClientProfileDto {
  return {
    clientProfile: {
      companyName: raw.companyName,
      logo: raw.logo ?? '',
      description: raw.description ?? '',
      website: raw.website ?? '',
    },
  };
}

export function mapUserModelToClientProfileUpdateResponseDto(
  raw: IUser,
): ClientProfileUpdateResponseDto {
  return {
    companyName: raw.clientProfile.companyName,
    logo: raw.clientProfile.logo ?? '',
    description: raw.clientProfile.description ?? '',
    website: raw.clientProfile.website ?? '',
  };
}

export function mapUserModelToAddressDto(raw: IUser): AddressDTO {
  return {
    country: raw?.address?.country,
    state: raw?.address?.state,
    streetAddress: raw?.address?.streetAddress,
    city: raw?.address?.city,
    zipCode: raw?.address?.zipCode,
  };
}

export function mapAddressDtoToUserModel(address: AddressDTO): IAddress {
  return {
    country: address?.country,
    state: address?.state,
    streetAddress: address?.streetAddress,
    city: address?.city,
    zipCode: address?.zipCode,
  };
}

export function UserDetailDtoToUserModel(raw: Partial<UserProfileDto>): UserProfileDto {
  return {
    firstName: raw.firstName || '',
    lastName: raw.lastName || '',
    email: raw.email || '',
    phone: !isNaN(Number(raw.phone)) ? Number(raw.phone) : 0,
    dob: raw.dob,
  };
}

export function mapWorkHistoryToUserModel(exp: IExperience): IExperience {
  return {
    title: exp.title || '',
    company: exp.company || '',
    location: exp.location || '',
    country: exp.country || '',
    startMonth: exp.startMonth || '',
    startYear: exp.startYear || 0,
    endMonth: exp.endMonth || undefined,
    endYear: exp.endYear || undefined,
    isCurrentRole: exp.isCurrentRole || false,
  };
}
