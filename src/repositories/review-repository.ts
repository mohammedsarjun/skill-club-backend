import BaseRepository from './baseRepositories/base-repository';
import { IReview, IReviewDocument } from '../models/interfaces/review.model.interface';
import { Review } from '../models/review.model';
import { IReviewRepository } from './interfaces/review-repository.interface';
import { injectable } from 'tsyringe';
import { Types } from 'mongoose';

@injectable()
export class ReviewRepository extends BaseRepository<IReviewDocument> implements IReviewRepository {
  constructor() {
    super(Review);
  }

  async createReview(data: Partial<IReview>): Promise<IReviewDocument> {
    return (await super.create(data)) as IReviewDocument;
  }

  async findByContractId(contractId: string): Promise<IReviewDocument | null> {
    return (await super.findOne({
      contractId: new Types.ObjectId(contractId),
      isDeleted: false,
    })) as IReviewDocument | null;
  }

  async findByContractIdAndReviewerId(
    contractId: string,
    reviewerId: string,
  ): Promise<IReviewDocument | null> {
    return (await super.findOne({
      contractId: new Types.ObjectId(contractId),
      reviewerId: new Types.ObjectId(reviewerId),
      isDeleted: false,
    })) as IReviewDocument | null;
  }

  async findReviewsByFreelancerId(
    freelancerId: string,
    page: number,
    limit: number,
  ): Promise<{ reviews: IReviewDocument[]; total: number }> {
    const skip = (page - 1) * limit;

    const sortedReviews = await Review.find({
      revieweeId: new Types.ObjectId(freelancerId),
      reviewerRole: 'client',
      isDeleted: false,
      isHideByAdmin: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await super.count({
      revieweeId: new Types.ObjectId(freelancerId),
      reviewerRole: 'client',
      isDeleted: false,
      isHideByAdmin: false,
    });
    return { reviews: sortedReviews as IReviewDocument[], total };
  }

  async getAverageRatingByFreelancerId(freelancerId: string): Promise<number> {
    const result = await Review.aggregate([
      {
        $match: {
          revieweeId: new Types.ObjectId(freelancerId),
          reviewerRole: 'client',
          isDeleted: false,
          isHideByAdmin: false,
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
        },
      },
    ]);

    return result.length > 0 ? Number(result[0].averageRating.toFixed(1)) : 0;
  }

  async getAllReviews(
    page: number,
    limit: number,
    filters?: { reviewerRole?: 'client' | 'freelancer'; isHideByAdmin?: boolean },
  ): Promise<{ reviews: IReviewDocument[]; total: number }> {
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { isDeleted: false };

    if (filters?.reviewerRole) {
      query.reviewerRole = filters.reviewerRole;
    }

    if (filters?.isHideByAdmin !== undefined) {
      query.isHideByAdmin = filters.isHideByAdmin;
    }

    const reviews = await Review.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();

    const total = await super.count(query);

    return { reviews: reviews as IReviewDocument[], total };
  }

  async toggleHideReview(reviewId: string): Promise<IReviewDocument | null> {
    const review = await super.findById(reviewId);

    if (!review) {
      return null;
    }

    const updated = await super.updateById(reviewId, {
      isHideByAdmin: !review.isHideByAdmin,
    });

    return updated as IReviewDocument | null;
  }

  async getRecentReviews(limit: number): Promise<IReviewDocument[]> {
    return (await this.model
      .find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('reviewerId', 'firstName lastName')
      .populate('revieweeId', 'firstName lastName')
      .lean()) as IReviewDocument[];
  }

  async getRecentReviewsForFreelancer(
    freelancerId: string,
    limit: number,
  ): Promise<IReviewDocument[]> {
    return (await this.model
      .find({
        revieweeId: freelancerId,
        isDeleted: false,
        isHideByAdmin: false,
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('reviewerId', 'firstName lastName')
      .populate('contractId', 'title')
      .lean()) as IReviewDocument[];
  }
}
