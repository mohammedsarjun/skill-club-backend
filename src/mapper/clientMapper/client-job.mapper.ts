import { Types } from 'mongoose';
import {
  CreateJobDto,
  ClientJobResponseDto,
  ClientJobDetailResponseDTO,
  UpdateJobDto,
} from '../../dto/clientDTO/client-job.dto';
import {
  IJobDetail,
  IJobWithCategoryDetail,
  JobData,
} from '../../models/interfaces/job.model.interface';

export const mapCreateJobDtoToJobModel = (
  jobData: CreateJobDto,
  clientId: string,
): Partial<JobData> => {
  return {
    title: jobData.title,
    description: jobData.description,
    category: jobData.category,
    specialities: jobData.specialities.map((spec) => new Types.ObjectId(spec)),
    skills: jobData.skills.map((skill) => new Types.ObjectId(skill)),
    rateType: jobData.rateType,
    hourlyRate: jobData.hourlyRate,
    fixedRate: jobData.fixedRate,
    clientId: new Types.ObjectId(clientId),
  };
};

export const mapUpdateJobDtoToJobModel = (jobData: UpdateJobDto): Partial<JobData> => {
  return {
    title: jobData.title,
    description: jobData.description,
    category: jobData.category,
    specialities: jobData.specialities.map((spec) => new Types.ObjectId(spec)),
    skills: jobData.skills.map((skill) => new Types.ObjectId(skill)),
    rateType: jobData.rateType,
    hourlyRate: jobData.hourlyRate,
    fixedRate: jobData.fixedRate,
  };
};

export const mapJobModelDtoToClientJobResponseDto = (
  jobData: IJobWithCategoryDetail,
): ClientJobResponseDto => {
  return {
    jobId: jobData._id?.toString()!,
    jobTitle: jobData.title,
    companyName: jobData?.clientId?.companyName,
    category: { categoryId: jobData.category._id, categoryName: jobData.category.name },
    totalProposal: 0,
    status: jobData.status,
    budget: {
      rateType: jobData.rateType,
      min: (jobData.rateType == 'fixed' ? jobData?.fixedRate?.min : jobData?.hourlyRate?.min) || 0,
      max: (jobData.rateType == 'fixed' ? jobData?.fixedRate?.max : jobData?.hourlyRate?.max) || 0,
    },
  };
};

export function mapJobModelToClientJobDetailResponseDTO(
  dto: IJobDetail,
): ClientJobDetailResponseDTO {
  return {
    jobId: dto._id?.toString()!,
    jobTitle: dto.title,
    jobDescription: dto.description,
    category: { categoryId: dto.category._id, categoryName: dto.category.name },
    totalProposal: 0,
    status: dto.status,
    budget: {
      rateType: dto.rateType,
      min: (dto.rateType == 'fixed' ? dto?.fixedRate?.min : dto?.hourlyRate?.min) || 0,
      max: (dto.rateType == 'fixed' ? dto?.fixedRate?.max : dto?.hourlyRate?.max) || 0,
      hoursPerWeek: dto.rateType == 'hourly' ? dto?.hourlyRate?.hoursPerWeek : undefined,
      estimatedDuration: dto.rateType == 'hourly' ? dto?.hourlyRate?.estimatedDuration : undefined,
    },
    specialities: dto.specialities.map((spec) => ({
      specialityId: spec._id.toString(),
      specialityName: spec.name,
    })),
    skills: dto.skills.map((skill) => ({
      skillId: skill._id.toString(),
      skillName: skill.name,
    })),
    clientDetail: {
      clientId: dto?.clientId?._id.toString() || '',
      companyName: dto?.clientId?.clientProfile?.companyName || '',
      companyLogo: dto?.clientId?.clientProfile?.logo || '',
    },
    rejectedReason: dto.rejectedReason,
    suspendedReason: dto.suspendedReason,
  };
}
