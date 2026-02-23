// import { IUser } from 'src/models/interfaces/user.model.interface';
import {
  IExperience,
  IFreelancerData,
  IFreelancerDetailData,
  ILanguage,
} from '../../models/interfaces/user.model.interface';
import {
  ClientFreelancerResponseDto,
  FetchClientFreelancerDTO,
  FetchClientFreelancerPortfolioDTO,
  freelancerParams,
} from '../../dto/clientDTO/client-freelancer.dto';
import { Types } from 'mongoose';
import { EducationDTO, ExperienceDTO, IEducationDTO } from '../../dto/freelancer.dto';
import { mapEducationModelToDTO } from '../freelancer.mapper';
import { LanguageDTO } from '../../dto/user.dto';
import { IPortfolio } from '../../models/interfaces/portfolio.model.interface';

export interface FreelancerModelQuery {
  roles?: string;
  $or?: Record<string, unknown>[];
  _id?: { $ne: Types.ObjectId };
  isFreelancerBlocked?: boolean;
  'freelancerProfile.workCategory'?: Types.ObjectId;
  'freelancerProfile.specialties'?: Types.ObjectId;
  'freelancerProfile.skills'?: { $in: Types.ObjectId[] };
  'freelancerProfile.languages.name'?: { $in: string[] };
  'freelancerProfile.hourlyRate'?: { $gte?: number; $lte?: number };
  'address.country'?: { $regex: string; $options: string };
  'freelancerProfile.jobSuccessRate'?: { $gte: number };
}

export const mapClientQueryToFreelancerModelQuery = (
  clientUserId: string,
  freelancerQuery: freelancerParams,
): FreelancerModelQuery => {
  const query: FreelancerModelQuery = {};

  query.roles = 'freelancer';
  query.isFreelancerBlocked = false;

  console.log("client id",clientUserId)
  if (clientUserId) {
    query._id = { $ne: new Types.ObjectId(clientUserId) };
  }

  if (freelancerQuery.search) {
    const trimmed = freelancerQuery.search.trim();
    query.$or = [
      { firstName: { $regex: trimmed, $options: 'i' } },
      { lastName: { $regex: trimmed, $options: 'i' } },
      {
        'freelancerProfile.professionalRole': {
          $regex: trimmed,
          $options: 'i',
        },
      },
      {
        $expr: {
          $regexMatch: {
            input: { $concat: ['$firstName', ' ', '$lastName'] },
            regex: trimmed,
            options: 'i',
          },
        },
      },
    ];
  }


  if (freelancerQuery.categoryId) {
    query['freelancerProfile.workCategory'] = new Types.ObjectId(freelancerQuery.categoryId);
  }

  if (freelancerQuery.specialityId) {
    query['freelancerProfile.specialties'] = new Types.ObjectId(freelancerQuery.specialityId);
  }

  if (freelancerQuery.skillIds?.length) {
    query['freelancerProfile.skills'] = {
      $in: freelancerQuery.skillIds.map((skillId) => new Types.ObjectId(skillId)),
    };
  }

  if (freelancerQuery.languages?.length) {
    query['freelancerProfile.languages.name'] = {
      $in: freelancerQuery.languages.map(
        (lang) => new RegExp(`^${lang}$`, 'i'),
      ) as unknown as string[],
    };
  }

  if (freelancerQuery.minHourlyRate || freelancerQuery.maxHourlyRate) {
    query['freelancerProfile.hourlyRate'] = {};
    if (freelancerQuery.minHourlyRate)
      query['freelancerProfile.hourlyRate'].$gte = Number(freelancerQuery.minHourlyRate);
    if (freelancerQuery.maxHourlyRate)
      query['freelancerProfile.hourlyRate'].$lte = Number(freelancerQuery.maxHourlyRate);
  }

  if (freelancerQuery.location) {
    query['address.country'] = {
      $regex: freelancerQuery.location,
      $options: 'i',
    };
  }

  // if (freelancerQuery.jobSuccessRate) {
  //   query['freelancerProfile.jobSuccessRate'] = {
  //     $gte: freelancerQuery.jobSuccessRate,
  //   };
  // }

  return query;
};

export const mapUserModelToClientFreelancerResponseDto = (
  userData: IFreelancerData,
): ClientFreelancerResponseDto => ({
  freelancerId: userData.freelancerId,
  logo: userData.logo,
  freelancerName: `${userData.firstName} ${userData?.lastName}`,
  professionalRole: userData.professionalRole,
  country: userData.country,
  hourlyRate: userData.hourlyRate,
  jobSuccessRate: userData.jobSuccessRate,
  totalEarnedAmount: userData.totalEarnedAmount,
  categoryId: userData.categoryId,
  specialityIds: userData.specialityIds,
  skills: userData.skills,
  bio: userData.bio,
  language: userData.language,
});

export const mapFreelancerToFetchClientFreelancerDTO = (
  user: IFreelancerDetailData,
  averageRating: number,
  totalReviews: number,
): FetchClientFreelancerDTO => {
  return {
    name: `${user?.firstName} ${user?.lastName}`,
    address: user.address!,
    logo: user?.logo || '',
    workCategory: user?.workCategory,
    specialties:
      user?.specialties?.map((spec) => ({ id: spec.id.toString(), name: spec.name })) || [],
    skills: user?.skills?.map((skill) => ({ id: skill.id.toString(), name: skill.name })) || [],
    professionalRole: user?.professionalRole || '',
    experiences: user?.experiences?.map(mapExperienceToDTO) || [],
    education: user?.education?.map((edu) => mapEducationModelToDTO(edu)) || [],
    languages: user?.languages?.map(mapLanguageToDTO) || [],
    bio: user?.bio || '',
    hourlyRate: user?.hourlyRate || 0,
    portfolio: null,
    jobSuccessRate: user?.jobSuccessRate || 0,
    totalEarnedAmount: user?.totalEarnedAmount || 0,
    averageRating: averageRating || 0,
    totalReviews: totalReviews || 0,
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

export const mapPortfolioToFetchClientPortfolioDTO = (
  data: IPortfolio,
): FetchClientFreelancerPortfolioDTO => ({
  id: data._id.toString(),
  title: data.title,
  description: data.description,
  technologies: data.technologies,
  role: data.role,
  projectUrl: data.projectUrl,
  githubUrl: data.githubUrl,
  images: data.images,
  video: data.video,
});
