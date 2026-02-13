import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IClientFreelancerReviewService } from './interfaces/client-freelancer-review-service.interface';
import { IReviewRepository } from '../../repositories/interfaces/review-repository.interface';
import { IUserRepository } from '../../repositories/interfaces/user-repository.interface';
import {
  FreelancerReviewQueryDTO,
  FreelancerReviewsResponseDTO,
} from '../../dto/clientDTO/client-freelancer-review.dto';
import { mapReviewToFreelancerReviewItemDTO } from '../../mapper/clientMapper/client-freelancer-review.mapper';

@injectable()
export class ClientFreelancerReviewService implements IClientFreelancerReviewService {
  private _reviewRepository: IReviewRepository;
  private _userRepository: IUserRepository;

  constructor(
    @inject('IReviewRepository') reviewRepository: IReviewRepository,
    @inject('IUserRepository') userRepository: IUserRepository,
  ) {
    this._reviewRepository = reviewRepository;
    this._userRepository = userRepository;
  }

  async getFreelancerReviews(
    freelancerId: string,
    query: FreelancerReviewQueryDTO,
  ): Promise<FreelancerReviewsResponseDTO> {
    const { page, limit } = query;

    const { reviews, total } = await this._reviewRepository.findReviewsByFreelancerId(
      freelancerId,
      page,
      limit,
    );

    const averageRating = await this._reviewRepository.getAverageRatingByFreelancerId(freelancerId);

    const reviewItems = await Promise.all(
      reviews.map(async (review) => {
        const reviewer = await this._userRepository.findById(String(review.reviewerId));
        const reviewerData = {
          name: reviewer
            ? `${reviewer.firstName || ''} ${reviewer.lastName || ''}`.trim()
            : 'Anonymous',
          companyName: reviewer?.clientProfile?.companyName,
          logo: reviewer?.clientProfile?.logo,
        };
        return mapReviewToFreelancerReviewItemDTO(review, reviewerData);
      }),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      reviews: reviewItems,
      stats: {
        averageRating,
        totalReviews: total,
      },
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }
}
