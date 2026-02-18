import { injectable, inject } from 'tsyringe';
import { IFreelancerDashboardServices } from './interfaces/freelancer-dashboard-services.interface';
import {
  FreelancerContractStatsDto,
  FreelancerEarningsDto,
  FreelancerMeetingDto,
  FreelancerReviewStatsDto,
} from '../../dto/freelancerDTO/freelancer-dashboard.dto';
import type { IContractRepository } from '../../repositories/interfaces/contract-repository.interface';
import type { IFreelancerWalletRepository } from '../../repositories/interfaces/freelancer-wallet-repository.interface';
import type { IContractTransactionRepository } from '../../repositories/interfaces/contract-transaction-repository.interface';
import type { IMeetingRepository } from '../../repositories/interfaces/meeting-repository.interface';
import type { IReviewRepository } from '../../repositories/interfaces/review-repository.interface';
import {
  mapToContractStatsDto,
  mapToEarningsDto,
  mapToMeetingDto,
  mapToReviewDto,
  mapToReviewStatsDto,
} from '../../mapper/freelancerMapper/freelancer-dashboard.mapper';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { ERROR_MESSAGES } from '../../contants/error-constants';

@injectable()
export class FreelancerDashboardServices implements IFreelancerDashboardServices {
  private _contractRepository: IContractRepository;
  private _walletRepository: IFreelancerWalletRepository;
  private _transactionRepository: IContractTransactionRepository;
  private _meetingRepository: IMeetingRepository;
  private _reviewRepository: IReviewRepository;

  constructor(
    @inject('IContractRepository') contractRepository: IContractRepository,
    @inject('IFreelancerWalletRepository') walletRepository: IFreelancerWalletRepository,
    @inject('IContractTransactionRepository') transactionRepository: IContractTransactionRepository,
    @inject('IMeetingRepository') meetingRepository: IMeetingRepository,
    @inject('IReviewRepository') reviewRepository: IReviewRepository,
  ) {
    this._contractRepository = contractRepository;
    this._walletRepository = walletRepository;
    this._transactionRepository = transactionRepository;
    this._meetingRepository = meetingRepository;
    this._reviewRepository = reviewRepository;
  }

  async getContractStats(freelancerId: string): Promise<FreelancerContractStatsDto> {
    const activeCount = await this._contractRepository.countByFreelancerAndStatus(
      freelancerId,
      'active',
    );

    const pendingCount = await this._contractRepository.countByFreelancerAndStatus(
      freelancerId,
      'pending_funding',
    );

    const completedCount = await this._contractRepository.countByFreelancerAndStatus(
      freelancerId,
      'completed',
    );

    return mapToContractStatsDto(activeCount, pendingCount, completedCount);
  }

  async getEarnings(freelancerId: string): Promise<FreelancerEarningsDto> {
    const wallet = await this._walletRepository.findByFreelancerId(freelancerId);

    if (!wallet) {
      throw new AppError(ERROR_MESSAGES.FREELANCER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const pendingPayment =
      await this._transactionRepository.findPendingEarningsByFreelancerId(freelancerId);

    return mapToEarningsDto(
      wallet.totalEarned,
      wallet.balance,
      wallet.totalCommissionPaid,
      pendingPayment,
    );
  }

  async getMeetings(freelancerId: string): Promise<FreelancerMeetingDto[]> {
    const contracts = await this._contractRepository.findAllForFreelancer(freelancerId, {
      page: 1,
      limit: 1000,
      filters: { status: 'active' },
    });

    const contractIds = contracts.map((contract) => contract._id?.toString() || '');

    if (contractIds.length === 0) {
      return [];
    }

    const meetings = await this._meetingRepository.findUpcomingMeetingsByFreelancerId(contractIds);

    return meetings.map((m) =>
      mapToMeetingDto(m as unknown as Parameters<typeof mapToMeetingDto>[0]),
    );
  }

  async getReviewStats(freelancerId: string): Promise<FreelancerReviewStatsDto> {
    const averageRating = await this._reviewRepository.getAverageRatingByFreelancerId(freelancerId);
    const { total } = await this._reviewRepository.findReviewsByFreelancerId(freelancerId, 1, 1);
    const recentReviews = await this._reviewRepository.getRecentReviewsForFreelancer(
      freelancerId,
      3,
    );

    const recentDtos = recentReviews.map((r) =>
      mapToReviewDto(r as unknown as Parameters<typeof mapToReviewDto>[0]),
    );

    return mapToReviewStatsDto(averageRating, total, recentDtos);
  }
}
