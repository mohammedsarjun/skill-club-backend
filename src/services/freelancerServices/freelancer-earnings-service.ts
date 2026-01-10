import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IFreelancerEarningsService } from './interfaces/freelancer-earnings-service.interface';
import { IContractTransactionRepository } from '../../repositories/interfaces/contract-transaction-repository.interface';
import { IFreelancerWalletRepository } from '../../repositories/interfaces/freelancer-wallet-repository.interface';
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
  private _freelancerWalletRepository: IFreelancerWalletRepository;

  constructor(
    @inject('IContractTransactionRepository') contractTransactionRepository: IContractTransactionRepository,
    @inject('IFreelancerWalletRepository') freelancerWalletRepository: IFreelancerWalletRepository,
  ) {
    this._contractTransactionRepository = contractTransactionRepository;
    this._freelancerWalletRepository = freelancerWalletRepository;
  }

  async getEarningsOverview(freelancerId: string): Promise<FreelancerEarningsOverviewDTO> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError(ERROR_MESSAGES.INVALID_ID, HttpStatus.BAD_REQUEST);
    }

    const wallet = await this._freelancerWalletRepository.findByFreelancerId(freelancerId);
    
    if (!wallet) {
      throw new AppError(ERROR_MESSAGES.FREELANCER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const pending = await this._contractTransactionRepository.findPendingEarningsByFreelancerId(freelancerId);

    return {
      available: wallet.balance || 0,
      pending: pending || 0,
      totalEarnings: wallet.totalEarned || 0,
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
