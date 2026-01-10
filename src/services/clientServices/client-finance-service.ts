import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IClientFinanceService } from './interfaces/client-finance-service.interface';
import { ClientFinanceDTO } from '../../dto/clientDTO/client-finance.dto';
import { IContractTransactionRepository } from '../../repositories/interfaces/contract-transaction-repository.interface';
import { IClientWalletRepository } from '../../repositories/interfaces/client-wallet-repository.interface';
import { mapTransactionToDTO, mapFinanceStatsToDTO } from '../../mapper/clientMapper/client-finance.mapper';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { ERROR_MESSAGES } from '../../contants/error-constants';

@injectable()
export class ClientFinanceService implements IClientFinanceService {
  private _contractTransactionRepository: IContractTransactionRepository;
  private _clientWalletRepository: IClientWalletRepository;

  constructor(
    @inject('IContractTransactionRepository') contractTransactionRepository: IContractTransactionRepository,
    @inject('IClientWalletRepository') clientWalletRepository: IClientWalletRepository
  ) {
    this._contractTransactionRepository = contractTransactionRepository;
    this._clientWalletRepository = clientWalletRepository;
  }

  async getFinanceData(clientId: string): Promise<ClientFinanceDTO> {
    const wallet = await this._clientWalletRepository.findByClientId(clientId);
    
    if (!wallet) {
      throw new AppError(ERROR_MESSAGES.CLIENT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

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

    const stats = mapFinanceStatsToDTO(
      wallet.totalFunded,
      wallet.totalRefunded,
      wallet.balance
    );

    return {
      stats,
      spentTransactions,
      refundTransactions,
    };
  }
}
