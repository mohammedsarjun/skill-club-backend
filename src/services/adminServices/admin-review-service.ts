import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IAdminReviewService } from '../interfaces/admin-review-service.interface';
import { IReviewRepository } from '../../repositories/interfaces/review-repository.interface';
import { IUserRepository } from '../../repositories/interfaces/user-repository.interface';
import {
  AdminReviewQueryDTO,
  AdminReviewsResponseDTO,
  ToggleHideReviewResponseDTO,
} from '../../dto/adminDTO/admin-review.dto';
import { mapReviewToAdminReviewItemDTO } from '../../mapper/adminMapper/admin-review.mapper';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { ERROR_MESSAGES } from '../../contants/error-constants';

@injectable()
export class AdminReviewService implements IAdminReviewService {
  private _reviewRepository: IReviewRepository;
  private _userRepository: IUserRepository;

  constructor(
    @inject('IReviewRepository') reviewRepository: IReviewRepository,
    @inject('IUserRepository') userRepository: IUserRepository,
  ) {
    this._reviewRepository = reviewRepository;
    this._userRepository = userRepository;
  }

  async getReviews(query: AdminReviewQueryDTO): Promise<AdminReviewsResponseDTO> {
    const { page, limit, reviewerRole, isHideByAdmin } = query;

    const filters: { reviewerRole?: 'client' | 'freelancer'; isHideByAdmin?: boolean } = {};
    
    if (reviewerRole) {
      filters.reviewerRole = reviewerRole;
    }
    
    if (isHideByAdmin !== undefined) {
      filters.isHideByAdmin = isHideByAdmin;
    }

    const { reviews, total } = await this._reviewRepository.getAllReviews(page, limit, filters);

    const reviewerIds = reviews.map((review) => String(review.reviewerId));
    const revieweeIds = reviews.map((review) => String(review.revieweeId));
    const uniqueUserIds = [...new Set([...reviewerIds, ...revieweeIds])];

    const users = await Promise.all(
      uniqueUserIds.map((userId) => this._userRepository.findById(userId)),
    );

    const userMap = new Map(
      users.filter((user) => user !== null).map((user) => [String(user!._id), user!]),
    );

    const reviewItems = reviews.map((review) =>
      mapReviewToAdminReviewItemDTO(
        review,
        userMap.get(String(review.reviewerId)) || null,
        userMap.get(String(review.revieweeId)) || null,
      ),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      reviews: reviewItems,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async toggleHideReview(reviewId: string): Promise<ToggleHideReviewResponseDTO> {
    const review = await this._reviewRepository.toggleHideReview(reviewId);

    if (!review) {
      throw new AppError(ERROR_MESSAGES.REVIEW.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return {
      reviewId: String(review._id),
      isHideByAdmin: review.isHideByAdmin,
    };
  }
}
