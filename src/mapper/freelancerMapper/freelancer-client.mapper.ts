import { FreelancerClientMinimalDTO } from '../../dto/freelancerDTO/freelancer-client.dto';
import { IUser } from '../../models/interfaces/user.model.interface';

export function mapuserModelToFreelancerClientMinimalDTO(
  userData: IUser,
  totalJobsPosted: number,
): FreelancerClientMinimalDTO {
  return {
    companyName: userData.clientProfile.companyName,
    country: userData?.address?.country,
    rating: 0,
    totalJobsPosted,
  };
}
