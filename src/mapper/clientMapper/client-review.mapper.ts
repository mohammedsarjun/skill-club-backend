import { IReview } from '../../models/interfaces/review.model.interface';
import { ReviewResponseDTO } from '../../dto/clientDTO/client-review.dto';

export function mapReviewToResponseDTO(review: IReview): ReviewResponseDTO {
  return {
    reviewId: (review as unknown as { _id: { toString(): string } })._id.toString(),
    contractId: review.contractId.toString(),
    reviewerId: review.reviewerId.toString(),
    revieweeId: review.revieweeId.toString(),
    reviewerRole: review.reviewerRole,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt!,
  };
}
