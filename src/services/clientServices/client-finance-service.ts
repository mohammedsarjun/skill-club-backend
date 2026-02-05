import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IClientFinanceService } from './interfaces/client-finance-service.interface';
import { ClientFinanceDTO } from '../../dto/clientDTO/client-finance.dto';
import { IContractTransactionRepository } from '../../repositories/interfaces/contract-transaction-repository.interface';
import { Types } from 'mongoose';
import AppError from '../../utils/app-error';
import { ERROR_MESSAGES } from '../../contants/error-constants';

import { mapTransactionToDTO, mapFinanceStatsToDTO } from '../../mapper/clientMapper/client-finance.mapper';
import { IContractTransaction } from '../../models/interfaces/contract-transaction.model.interface';


@injectable()
export class ClientFinanceService implements IClientFinanceService {
  private _contractTransactionRepository: IContractTransactionRepository;


  constructor(
    @inject('IContractTransactionRepository') contractTransactionRepository: IContractTransactionRepository,

  ) {
    this._contractTransactionRepository = contractTransactionRepository;

  }

  async getFinanceData(clientId: string): Promise<ClientFinanceDTO> {

    const spentTransactionsData = await this._contractTransactionRepository.findSpentTransactionsByClientId(clientId);
    const refundTransactionsData = await this._contractTransactionRepository.findRefundTransactionsByClientId(clientId);

    const spentTransactions = spentTransactionsData.map((transaction) => {
      const freelancer = transaction.freelancerId as unknown as { firstName: string; lastName: string };
      const freelancerName = transaction.purpose === 'commission' 
        ? 'Platform' 
        : `${freelancer.firstName} ${freelancer.lastName}`;
      return mapTransactionToDTO(transaction, freelancerName);
    });

    const refundTransactions = refundTransactionsData.map((transaction) => {
      const freelancer = transaction.freelancerId as unknown as { firstName: string; lastName: string };
      const freelancerName = `${freelancer.firstName} ${freelancer.lastName}`;
      return mapTransactionToDTO(transaction, freelancerName);
    });

    const totalFunded = await this._contractTransactionRepository.getTotalFundedByClientId(clientId);
    const totalRefunded = await this._contractTransactionRepository.findTotalRefundByClientId(clientId);
    const totalWithdrawn = await this._contractTransactionRepository.findTotalWithdrawalByClientId(clientId);
    const available = totalRefunded - totalWithdrawn;
    const stats = mapFinanceStatsToDTO(totalFunded, totalRefunded, available);

    return {
      stats,
      spentTransactions,
      refundTransactions,
    };
  }

  async requestWithdrawal(clientId: string, amount: number, note?: string): Promise<any> {
    if (!amount || amount <= 0) {
      throw new AppError(ERROR_MESSAGES.FINANCE.INVALID_AMOUNT, 400);
    }

    const totalRefunded = await this._contractTransactionRepository.findTotalRefundByClientId(clientId);
    const totalWithdrawn = await this._contractTransactionRepository.findTotalWithdrawalByClientId(clientId);
    const available = totalRefunded - totalWithdrawn;

    if (amount > available) {
      throw new AppError(ERROR_MESSAGES.FINANCE.INSUFFICIENT_BALANCE, 400);
    }

    // ensure bank details exist for client
    const bankRepo = (this as any)._bankRepository as any;
    if (bankRepo) {
      const bank = await bankRepo.findByUserId(clientId);
      if (!bank) {
        throw new AppError(ERROR_MESSAGES.BANK.NOT_FOUND, 400);
      }
    }

    const created = await this._contractTransactionRepository.createTransaction({
      contractId: new Types.ObjectId(),
      clientId: new Types.ObjectId(clientId),
      role:"client",
      amount,
      purpose: 'withdrawal',
      status: 'withdrawal_requested',
      description: note || 'Client withdrawal request',
      metadata: { requestedBy: clientId },
    });

    return mapTransactionToDTO(created, '');
  }

  async getWithdrawalHistory(clientId: string, page: number, limit: number): Promise<{items: any[]; total: number}> {
    const items = await this._contractTransactionRepository.findWithdrawalsByClientIdWithPagination(clientId, page, limit);
    const total = await this._contractTransactionRepository.countWithdrawalsByClientId(clientId);
    const dtos = items.map((t: IContractTransaction) => {
      const freelancer = t.freelancerId as unknown as { firstName?: string; lastName?: string };
      const freelancerName = freelancer?.firstName ? `${freelancer.firstName} ${freelancer.lastName}` : '';
      return mapTransactionToDTO(t, freelancerName);
    });
    return { items: dtos, total };
  }
}
