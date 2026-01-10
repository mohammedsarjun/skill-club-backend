import {
  FreelancerJobDetailResponseDto,
  FreelancerJobFiltersDto,
  FreelancerJobResponseDto,
} from '../../../dto/freelancerDTO/freelancer-job.dto';

export interface IFreelancerJobService {
  getAllJobs(
    freelancerUserId: string,
    filters: FreelancerJobFiltersDto,
  ): Promise<FreelancerJobResponseDto[] | null>;
  getJobDetail(freelancerUserId: string, jobId: string): Promise<FreelancerJobDetailResponseDto>;
}
