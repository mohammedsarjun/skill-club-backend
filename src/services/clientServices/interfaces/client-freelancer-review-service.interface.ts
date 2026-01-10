
import { FreelancerReviewQueryDTO ,FreelancerReviewsResponseDTO} from "src/dto/clientDTO/client-freelancer-review.dto";
export interface IClientFreelancerReviewService {
  getFreelancerReviews(freelancerId: string, query: FreelancerReviewQueryDTO): Promise<FreelancerReviewsResponseDTO>;
}
