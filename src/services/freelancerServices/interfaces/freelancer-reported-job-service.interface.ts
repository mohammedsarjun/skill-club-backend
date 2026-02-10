import { ReportJobDTO, ReportJobResponseDTO } from '../../../dto/freelancerDTO/freelancer-reported-job.dto';

export interface IFreelancerReportedJobService {
  reportJob(freelancerId: string, jobId: string, data: ReportJobDTO): Promise<ReportJobResponseDTO>;
  isJobReported(freelancerId: string, jobId: string): Promise<boolean>;
}

export default IFreelancerReportedJobService;
