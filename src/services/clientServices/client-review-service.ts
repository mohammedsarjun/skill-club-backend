import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IClientReviewService } from './interfaces/client-review-service.interface';
import { IReviewRepository } from '../../repositories/interfaces/review-repository.interface';
import { IContractRepository } from '../../repositories/interfaces/contract-repository.interface';
import {
  SubmitReviewDTO,
  ReviewStatusResponseDTO,
  ReviewResponseDTO,
} from '../../dto/clientDTO/client-review.dto';
import { mapReviewToResponseDTO } from '../../mapper/clientMapper/client-review.mapper';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { Types } from 'mongoose';

@injectable()
export class ClientReviewService implements IClientReviewService {
  private _reviewRepository: IReviewRepository;
  private _contractRepository: IContractRepository;

  constructor(
    @inject('IReviewRepository') reviewRepository: IReviewRepository,
    @inject('IContractRepository') contractRepository: IContractRepository,
  ) {
    this._reviewRepository = reviewRepository;
    this._contractRepository = contractRepository;
  }

  async submitReview(
    clientId: string,
    contractId: string,
    data: SubmitReviewDTO,
  ): Promise<ReviewResponseDTO> {
    if (data.rating < 1 || data.rating > 5) {
      throw new AppError(ERROR_MESSAGES.REVIEW.INVALID_RATING, HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findContractDetailByIdForClient(
      contractId,
      clientId,
    );

    if (!contract) {
      throw new AppError(ERROR_MESSAGES.REVIEW.CONTRACT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (contract.status !== 'completed' && contract.status !== 'cancelled') {
      throw new AppError(ERROR_MESSAGES.REVIEW.INVALID_STATUS, HttpStatus.BAD_REQUEST);
    }

    const existingReview = await this._reviewRepository.findByContractIdAndReviewerId(
      contractId,
      clientId,
    );

    if (existingReview) {
      throw new AppError(ERROR_MESSAGES.REVIEW.ALREADY_SUBMITTED, HttpStatus.BAD_REQUEST);
    }

    const review = await this._reviewRepository.createReview({
      contractId: new Types.ObjectId(contractId),
      reviewerId: new Types.ObjectId(clientId),
      revieweeId: contract.freelancerId as Types.ObjectId,
      reviewerRole: 'client',
      rating: data.rating,
      comment: data.comment,
      isDeleted: false,
      isHideByAdmin: false,
    });

    return mapReviewToResponseDTO(review);
  }

  async getReviewStatus(clientId: string, contractId: string): Promise<ReviewStatusResponseDTO> {
    const review = await this._reviewRepository.findByContractIdAndReviewerId(contractId, clientId);

    if (review) {
      return {
        hasReviewed: true,
        reviewId: (review as unknown as { _id: { toString(): string } })._id.toString(),
      };
    }

    return {
      hasReviewed: false,
    };
  }
}
