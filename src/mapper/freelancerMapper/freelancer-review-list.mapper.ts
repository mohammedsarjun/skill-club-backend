import { IReviewDocument } from '../../models/interfaces/review.model.interface';
import { IUser } from '../../models/interfaces/user.model.interface';
import { FreelancerReviewItemDTO } from '../../dto/freelancerDTO/freelancer-review-list.dto';

export function mapReviewToFreelancerReviewItemDTO(
  review: IReviewDocument,
  clientData: IUser | null,
): FreelancerReviewItemDTO {
  return {
    reviewId: String(review._id),
    clientName: clientData?.clientProfile.companyName || 'Unknown Client',
    clientCompanyName: clientData?.clientProfile.companyName,
    clientLogo: clientData?.clientProfile.logo,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt!,
  };
}
