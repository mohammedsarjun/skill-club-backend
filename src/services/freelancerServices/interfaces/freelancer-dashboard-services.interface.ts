import {
  FreelancerContractStatsDto,
  FreelancerEarningsDto,
  FreelancerMeetingDto,
  FreelancerReviewStatsDto,
} from '../../../dto/freelancerDTO/freelancer-dashboard.dto';

export interface IFreelancerDashboardServices {
  getContractStats(freelancerId: string): Promise<FreelancerContractStatsDto>;
  getEarnings(freelancerId: string): Promise<FreelancerEarningsDto>;
  getMeetings(freelancerId: string): Promise<FreelancerMeetingDto[]>;
  getReviewStats(freelancerId: string): Promise<FreelancerReviewStatsDto>;
}
