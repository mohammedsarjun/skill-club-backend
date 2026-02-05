import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IFreelancerFinanceService } from './interfaces/freelancer-finance-service.interface';
import { IContractTransactionRepository } from '../../repositories/interfaces/contract-transaction-repository.interface';
import AppError from '../../utils/app-error';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { Types } from 'mongoose';
import { IBankDetailsRepository } from '../../repositories/interfaces/bank-details-repository.interface';
import { mapContractTransactionToFreelancerTransactionItemDTO } from '../../mapper/freelancerMapper/freelancer-earnings.mapper';
import { IContractTransaction } from '../../models/interfaces/contract-transaction.model.interface';

@injectable()
export class FreelancerFinanceService implements IFreelancerFinanceService {
  private _contractTransactionRepository: IContractTransactionRepository;
  private _bankRepository: IBankDetailsRepository;

  constructor(
    @inject('IContractTransactionRepository')
    contractTransactionRepository: IContractTransactionRepository,
    @inject('IBankDetailsRepository') bankRepository: IBankDetailsRepository,
  ) {
    this._contractTransactionRepository = contractTransactionRepository;
    this._bankRepository = bankRepository;
  }

  async requestWithdrawal(freelancerId: string, amount: number, note?: string): Promise<any> {
    if (!amount || amount <= 0) {
      throw new AppError(ERROR_MESSAGES.FINANCE.INVALID_AMOUNT, 400);
    }

    const available =
      await this._contractTransactionRepository.getFreelancerAvailableBalance(freelancerId);
    if (amount > available) {
      throw new AppError(ERROR_MESSAGES.FINANCE.INSUFFICIENT_BALANCE, 400);
    }

    // ensure bank details exist for freelancer
    const bank = await this._bankRepository.findByUserId(freelancerId);
    if (!bank) {
      throw new AppError(ERROR_MESSAGES.BANK.NOT_FOUND, 400);
    }

    const created = await this._contractTransactionRepository.createTransaction({
      contractId: new Types.ObjectId(),
      freelancerId: new Types.ObjectId(freelancerId),
      role: 'freelancer',
      amount,
      purpose: 'withdrawal',
      status: 'withdrawal_requested',
      description: note || 'Freelancer withdrawal request',
      metadata: { requestedBy: freelancerId },
    } as Partial<IContractTransaction>);

    return mapContractTransactionToFreelancerTransactionItemDTO(created);
  }

  async getWithdrawalHistory(
    freelancerId: string,
    page: number,
    limit: number,
    status?: string,
  ): Promise<{ items: any[]; total: number }> {
    const items =
      await this._contractTransactionRepository.findWithdrawalsByFreelancerIdWithPagination(
        freelancerId,
        page,
        limit,
        status,
      );
    const total = await this._contractTransactionRepository.countWithdrawalsByFreelancerId(
      freelancerId,
      status,
    );
    const dtos = items.map((t: IContractTransaction) =>
      mapContractTransactionToFreelancerTransactionItemDTO(t),
    );
    return { items: dtos, total };
  }
}

export default FreelancerFinanceService;
