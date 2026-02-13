import { IReview, IReviewDocument } from '../../models/interfaces/review.model.interface';
import { FreelancerReviewItemDTO } from '../../dto/clientDTO/client-freelancer-review.dto';

export const mapReviewToFreelancerReviewItemDTO = (
  review: IReview | IReviewDocument,
  reviewerData: { name: string; companyName?: string; logo?: string },
): FreelancerReviewItemDTO => {
  return {
    reviewId: String((review as IReviewDocument)._id),
    reviewerName: reviewerData.name,
    reviewerCompanyName: reviewerData.companyName,
    reviewerLogo: reviewerData.logo,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt || new Date(),
  };
};
