import {
  AdminReviewQueryDTO,
  AdminReviewsResponseDTO,
  ToggleHideReviewResponseDTO,
} from '../../dto/adminDTO/admin-review.dto';

export interface IAdminReviewService {
  getReviews(query: AdminReviewQueryDTO): Promise<AdminReviewsResponseDTO>;
  toggleHideReview(reviewId: string): Promise<ToggleHideReviewResponseDTO>;
}
