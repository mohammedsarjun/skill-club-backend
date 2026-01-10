import { ReviewResponseDTO, ReviewStatusResponseDTO, SubmitReviewDTO } from '../../dto/freelancerDTO/freelancer-review.dto';
import { FreelancerReviewListResponseDTO, FreelancerReviewListQueryDTO } from '../../dto/freelancerDTO/freelancer-review-list.dto';

export interface IFreelancerReviewService {
  submitReview(contractId: string, freelancerId: string, data: SubmitReviewDTO): Promise<ReviewResponseDTO>;
  getReviewStatus(contractId: string, freelancerId: string): Promise<ReviewStatusResponseDTO>;
  getMyReviews(freelancerId: string, query: FreelancerReviewListQueryDTO): Promise<FreelancerReviewListResponseDTO>;
}
