import { injectable, inject } from 'tsyringe';
import { IAdminWithdrawalServices } from './interfaces/admin-withdrawal-controller.interface';
import { IContractTransactionRepository } from '../../repositories/interfaces/contract-transaction-repository.interface';
import { AdminWithdrawalStatsDTO, AdminWithdrawDTO } from '../../dto/adminDTO/admin-withdrawal.dto';
import { IUserRepository } from '../../repositories/interfaces/user-repository.interface';
import { IBankDetailsRepository } from '../../repositories/interfaces/bank-details-repository.interface';
import { IFreelancerWalletRepository } from '../../repositories/interfaces/freelancer-wallet-repository.interface';
import { mapContractTransactionToAdminWithdrawDTO } from '../../mapper/adminMapper/admin-withdrawal.mapper';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { extractObjectId } from '../../utils/extract-object-id';

@injectable()
export class AdminWithdrawalServices implements IAdminWithdrawalServices {
  private _contractTransactionRepository: IContractTransactionRepository;
  private _userRepository: IUserRepository;
  private _bankDetailsRepository: IBankDetailsRepository;
  private _freelancerWalletRepository: IFreelancerWalletRepository;

  constructor(
    @inject('IContractTransactionRepository')
    contractTransactionRepository: IContractTransactionRepository,
    @inject('IUserRepository') userRepository: IUserRepository,
    @inject('IBankDetailsRepository') bankDetailsRepository: IBankDetailsRepository,
    @inject('IFreelancerWalletRepository') freelancerWalletRepository: IFreelancerWalletRepository,
  ) {
    this._contractTransactionRepository = contractTransactionRepository;
    this._userRepository = userRepository;
    this._bankDetailsRepository = bankDetailsRepository;
    this._freelancerWalletRepository = freelancerWalletRepository;
  }

  async getWithdrawStats(): Promise<AdminWithdrawalStatsDTO> {
    return await this._contractTransactionRepository.getWithdrawStatsForAdmin();
  }

  async getWithdrawals(
    page: number,
    limit: number,
    role?: string,
    status?: string,
  ): Promise<{ items: AdminWithdrawDTO[]; total: number }> {
    try {
      const transactions = await this._contractTransactionRepository.findWithdrawalsForAdmin(
        page,
        limit,
        role,
        status,
      );
      const total = await this._contractTransactionRepository.countWithdrawalsForAdmin(
        role,
        status,
      );

      const results: AdminWithdrawDTO[] = [];

      for (const tx of transactions) {
        const freelancerId = extractObjectId(tx.freelancerId);

        const freelancer = freelancerId ? await this._userRepository.findById(freelancerId) : null;
        const bankDetails = freelancerId
          ? await this._bankDetailsRepository.findByUserId(freelancerId)
          : null;

        const dto = mapContractTransactionToAdminWithdrawDTO(
          tx,
          freelancer || null,
          bankDetails || null,
        );
        results.push(dto);
      }

      return { items: results, total };
    } catch {
      throw new AppError(ERROR_MESSAGES.GENERAL.SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getWithdrawalDetail(withdrawalId: string): Promise<AdminWithdrawDTO> {
    try {
      const transaction =
        await this._contractTransactionRepository.findWithdrawalById(withdrawalId);

      if (!transaction) {
        throw new AppError(ERROR_MESSAGES.GENERAL.NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      const freelancerId = extractObjectId(transaction.freelancerId);

      const freelancer = freelancerId ? await this._userRepository.findById(freelancerId) : null;
      const bankDetails = freelancerId
        ? await this._bankDetailsRepository.findByUserId(freelancerId)
        : null;

      return mapContractTransactionToAdminWithdrawDTO(
        transaction,
        freelancer || null,
        bankDetails || null,
      );
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(ERROR_MESSAGES.GENERAL.SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async approveWithdrawal(withdrawalId: string): Promise<void> {
    try {
      const transaction =
        await this._contractTransactionRepository.findWithdrawalById(withdrawalId);

      if (!transaction) {
        throw new AppError(ERROR_MESSAGES.GENERAL.NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      if (transaction.status !== 'withdrawal_requested') {
        throw new AppError('Withdrawal cannot be approved', HttpStatus.BAD_REQUEST);
      }

      await this._contractTransactionRepository.updateWithdrawalStatus(
        withdrawalId,
        'withdrawal_approved',
      );

      const freelancerId = extractObjectId(transaction.freelancerId);

      if (freelancerId) {
        await this._freelancerWalletRepository.incrementTotalWithdrawn(
          freelancerId,
          transaction.amount,
        );
        await this._freelancerWalletRepository.updateBalance(freelancerId, -transaction.amount);
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(ERROR_MESSAGES.GENERAL.SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async rejectWithdrawal(withdrawalId: string, _reason: string): Promise<void> {
    try {
      const transaction =
        await this._contractTransactionRepository.findWithdrawalById(withdrawalId);

      if (!transaction) {
        throw new AppError(ERROR_MESSAGES.GENERAL.NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      if (transaction.status !== 'withdrawal_requested') {
        throw new AppError('Withdrawal cannot be rejected', HttpStatus.BAD_REQUEST);
      }

      await this._contractTransactionRepository.updateWithdrawalStatus(withdrawalId, 'rejected');

      const freelancerId = extractObjectId(transaction.freelancerId);

      if (freelancerId) {
        await this._freelancerWalletRepository.updateBalance(freelancerId, transaction.amount);
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(ERROR_MESSAGES.GENERAL.SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
