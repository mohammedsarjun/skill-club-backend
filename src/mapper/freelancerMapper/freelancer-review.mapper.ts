import { IReview, IReviewDocument } from '../../models/interfaces/review.model.interface';
import { ReviewResponseDTO } from '../../dto/freelancerDTO/freelancer-review.dto';

export const mapReviewToResponseDTO = (review: IReview | IReviewDocument): ReviewResponseDTO => {
  return {
    reviewId: String((review as IReviewDocument)._id),
    contractId: String(review.contractId),
    reviewerId: String(review.reviewerId),
    revieweeId: String(review.revieweeId),
    reviewerRole: review.reviewerRole,
    rating: review.rating,
    createdAt: review.createdAt || new Date(),
  };
};
