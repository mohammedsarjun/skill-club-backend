import { IReviewDocument } from '../../models/interfaces/review.model.interface';
import { IUser } from '../../models/interfaces/user.model.interface';
import { AdminReviewItemDTO } from '../../dto/adminDTO/admin-review.dto';

export function mapReviewToAdminReviewItemDTO(
  review: IReviewDocument,
  reviewer: IUser | null,
  reviewee: IUser | null,
): AdminReviewItemDTO {
  const reviewerName =
    [reviewer?.firstName, reviewer?.lastName].filter(Boolean).join(' ').trim() || 'Unknown';
  const revieweeName =
    [reviewee?.firstName, reviewee?.lastName].filter(Boolean).join(' ').trim() || 'Unknown';

  return {
    reviewId: String(review._id),
    reviewerName,
    revieweeName,
    reviewerRole: review.reviewerRole,
    rating: review.rating,
    comment: review.comment,
    isHideByAdmin: review.isHideByAdmin,
    createdAt: review.createdAt!,
  };
}
