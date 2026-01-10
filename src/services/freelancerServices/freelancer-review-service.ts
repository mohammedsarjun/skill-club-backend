import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IFreelancerReviewService } from '../interfaces/freelancer-review-service.interface';
import { IReviewRepository } from '../../repositories/interfaces/review-repository.interface';
import { IContractRepository } from '../../repositories/interfaces/contract-repository.interface';
import { IUserRepository } from '../../repositories/interfaces/user-repository.interface';
import { IUser } from '../../models/interfaces/user.model.interface';
import {
  SubmitReviewDTO,
  ReviewStatusResponseDTO,
  ReviewResponseDTO,
} from '../../dto/freelancerDTO/freelancer-review.dto';
import {
  FreelancerReviewListQueryDTO,
  FreelancerReviewListResponseDTO,
} from '../../dto/freelancerDTO/freelancer-review-list.dto';
import { mapReviewToResponseDTO } from '../../mapper/freelancerMapper/freelancer-review.mapper';
import { mapReviewToFreelancerReviewItemDTO } from '../../mapper/freelancerMapper/freelancer-review-list.mapper';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { Types } from 'mongoose';
import { IReviewDocument } from '../../models/interfaces/review.model.interface';

@injectable()
export class FreelancerReviewService implements IFreelancerReviewService {
  private _reviewRepository: IReviewRepository;
  private _contractRepository: IContractRepository;
  private _userRepository: IUserRepository;

  constructor(
    @inject('IReviewRepository') reviewRepository: IReviewRepository,
    @inject('IContractRepository') contractRepository: IContractRepository,
    @inject('IUserRepository') userRepository: IUserRepository,
  ) {
    this._reviewRepository = reviewRepository;
    this._contractRepository = contractRepository;
    this._userRepository = userRepository;
  }

  async submitReview(
    contractId: string,
    freelancerId: string,
    data: SubmitReviewDTO,
  ): Promise<ReviewResponseDTO> {
    if (data.rating < 1 || data.rating > 5) {
      throw new AppError(ERROR_MESSAGES.REVIEW.INVALID_RATING, HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findDetailByIdForFreelancer(
      contractId,
      freelancerId,
    );

    if (!contract) {
      throw new AppError(ERROR_MESSAGES.REVIEW.CONTRACT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (contract.status !== 'completed' && contract.status !== 'cancelled') {
      throw new AppError(ERROR_MESSAGES.REVIEW.INVALID_STATUS, HttpStatus.BAD_REQUEST);
    }

    const existingReview = await this._reviewRepository.findByContractIdAndReviewerId(
      contractId,
      freelancerId,
    );

    if (existingReview) {
      throw new AppError(ERROR_MESSAGES.REVIEW.ALREADY_SUBMITTED, HttpStatus.BAD_REQUEST);
    }

    const review = await this._reviewRepository.createReview({
      contractId: new Types.ObjectId(contractId),
      reviewerId: new Types.ObjectId(freelancerId),
      revieweeId: contract.clientId as Types.ObjectId,
      reviewerRole: 'freelancer',
      rating: data.rating,
      isDeleted: false,
      isHideByAdmin: false,
    });

    return mapReviewToResponseDTO(review);
  }

  async getReviewStatus(
    contractId: string,
    freelancerId: string,
  ): Promise<ReviewStatusResponseDTO> {
    const review = await this._reviewRepository.findByContractIdAndReviewerId(
      contractId,
      freelancerId,
    );

    if (review) {
      return {
        hasReviewed: true,
        reviewId: String((review as IReviewDocument)._id),
      };
    }

    return {
      hasReviewed: false,
    };
  }

  async getMyReviews(
    freelancerId: string,
    query: FreelancerReviewListQueryDTO,
  ): Promise<FreelancerReviewListResponseDTO> {
    const { page, limit } = query;

    const { reviews, total } = await this._reviewRepository.findReviewsByFreelancerId(
      freelancerId,
      page,
      limit,
    );

    const clientIds = reviews.map((review) => String(review.reviewerId));
    const uniqueClientIds = [...new Set(clientIds)];

    const clientPromises = uniqueClientIds.map((clientId) =>
      this._userRepository.findById(clientId),
    );
    const clients = await Promise.all(clientPromises);

    const clientMap = new Map(
      clients
        .filter((client): client is IUser => client !== null)
        .map((client) => [String(client._id), client]),
    );

    const reviewItems = reviews.map((review) =>
      mapReviewToFreelancerReviewItemDTO(review, clientMap.get(String(review.reviewerId)) || null),
    );

    const averageRating = await this._reviewRepository.getAverageRatingByFreelancerId(freelancerId);

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
