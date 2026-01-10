import { AdminJobDetailResponseDTO, AdminJobResponseDTO } from '../../dto/adminDTO/admin-job.dto';
import { IJobDetail, IJobWithCategoryDetail } from '../../models/interfaces/job.model.interface';

export function mapJobModelToAdminJobResponseDTO(dto: IJobWithCategoryDetail): AdminJobResponseDTO {
  return {
    jobId: dto._id?.toString()!,
    jobTitle: dto.title,
    companyName: dto?.clientId?.companyName,
    category: { categoryId: dto.category._id, categoryName: dto.category.name },
    totalProposal: 0,
    status: dto.status,
    budget: {
      rateType: dto.rateType,
      min: (dto.rateType == 'fixed' ? dto?.fixedRate?.min : dto?.hourlyRate?.min) || 0,
      max: (dto.rateType == 'fixed' ? dto?.fixedRate?.max : dto?.hourlyRate?.max) || 0,
    },
  };
}

export function mapJobModelToAdminJobDetailResponseDTO(dto: IJobDetail): AdminJobDetailResponseDTO {
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
  };
}
