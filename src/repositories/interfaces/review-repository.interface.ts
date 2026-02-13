import BaseRepository from '../baseRepositories/base-repository';
import { IReview, IReviewDocument } from '../../models/interfaces/review.model.interface';

export interface IReviewRepository extends BaseRepository<IReviewDocument> {
  createReview(data: Partial<IReview>): Promise<IReviewDocument>;
  findByContractId(contractId: string): Promise<IReviewDocument | null>;
  findByContractIdAndReviewerId(
    contractId: string,
    reviewerId: string,
  ): Promise<IReviewDocument | null>;
  findReviewsByFreelancerId(
    freelancerId: string,
    page: number,
    limit: number,
  ): Promise<{ reviews: IReviewDocument[]; total: number }>;
  getAverageRatingByFreelancerId(freelancerId: string): Promise<number>;
  getRecentReviewsForFreelancer(freelancerId: string, limit: number): Promise<IReviewDocument[]>;
  getAllReviews(
    page: number,
    limit: number,
    filters?: { reviewerRole?: 'client' | 'freelancer'; isHideByAdmin?: boolean },
  ): Promise<{ reviews: IReviewDocument[]; total: number }>;
  toggleHideReview(reviewId: string): Promise<IReviewDocument | null>;
  getRecentReviews(limit: number): Promise<IReviewDocument[]>;
}
