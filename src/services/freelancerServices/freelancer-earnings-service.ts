import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IFreelancerEarningsService } from './interfaces/freelancer-earnings-service.interface';
import { IContractTransactionRepository } from '../../repositories/interfaces/contract-transaction-repository.interface';

import {
  FreelancerEarningsOverviewDTO,
  FreelancerTransactionsQueryDTO,
  FreelancerTransactionsListResultDTO,
} from '../../dto/freelancerDTO/freelancer-earnings.dto';
import { mapContractTransactionToFreelancerTransactionItemDTO } from '../../mapper/freelancerMapper/freelancer-earnings.mapper';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { Types } from 'mongoose';

@injectable()
export class FreelancerEarningsService implements IFreelancerEarningsService {
  private _contractTransactionRepository: IContractTransactionRepository;

  constructor(
    @inject('IContractTransactionRepository')
    contractTransactionRepository: IContractTransactionRepository,
  ) {
    this._contractTransactionRepository = contractTransactionRepository;
  }

  async getEarningsOverview(freelancerId: string): Promise<FreelancerEarningsOverviewDTO> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError(ERROR_MESSAGES.INVALID_ID, HttpStatus.BAD_REQUEST);
    }

    const totalEarnings =
      await this._contractTransactionRepository.getFreelancerTotalEarnings(freelancerId);
    const availableBalance =
      await this._contractTransactionRepository.getFreelancerAvailableBalance(freelancerId);
    const pendingWithdraw =
      await this._contractTransactionRepository.getPendingWithdraw(freelancerId);

    return {
      available: availableBalance || 0,
      pending: pendingWithdraw || 0,
      totalEarnings: totalEarnings || 0,
    };
  }

  async getTransactions(
    freelancerId: string,
    query: FreelancerTransactionsQueryDTO,
  ): Promise<FreelancerTransactionsListResultDTO> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError(ERROR_MESSAGES.INVALID_ID, HttpStatus.BAD_REQUEST);
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (query.filters?.startDate && query.filters?.endDate) {
      startDate = query.filters.startDate;
      endDate = query.filters.endDate;
    } else if (query.filters?.period) {
      const now = new Date();
      endDate = now;

      switch (query.filters.period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }
    }

    const transactions = await this._contractTransactionRepository.findByFreelancerIdWithPagination(
      freelancerId,
      page,
      limit,
      startDate,
      endDate,
    );

    const total = await this._contractTransactionRepository.countByFreelancerId(
      freelancerId,
      startDate,
      endDate,
    );

    const items = transactions.map(mapContractTransactionToFreelancerTransactionItemDTO);

    return {
      items,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
  }
}
