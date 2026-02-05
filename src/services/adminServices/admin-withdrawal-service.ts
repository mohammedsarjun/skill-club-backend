import { injectable, inject } from 'tsyringe';
import { IAdminWithdrawalServices } from './interfaces/admin-withdrawal-controller.interface';
import { IContractTransactionRepository } from '../../repositories/interfaces/contract-transaction-repository.interface';
import { AdminWithdrawalStatsDTO, AdminWithdrawDTO } from '../../dto/adminDTO/admin-withdrawal.dto';
import { IUserRepository } from '../../repositories/interfaces/user-repository.interface';
import { IBankDetailsRepository } from '../../repositories/interfaces/bank-details-repository.interface';
import { mapContractTransactionToAdminWithdrawDTO } from '../../mapper/adminMapper/admin-withdrawal.mapper';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { ERROR_MESSAGES } from '../../contants/error-constants';

@injectable()
export class AdminWithdrawalServices implements IAdminWithdrawalServices {
  private _contractTransactionRepository: IContractTransactionRepository;
  private _userRepository: IUserRepository;
  private _bankDetailsRepository: IBankDetailsRepository;

  constructor(
    @inject('IContractTransactionRepository')
    contractTransactionRepository: IContractTransactionRepository,
    @inject('IUserRepository') userRepository: IUserRepository,
    @inject('IBankDetailsRepository') bankDetailsRepository: IBankDetailsRepository,
  ) {
    this._contractTransactionRepository = contractTransactionRepository;
    this._userRepository = userRepository;
    this._bankDetailsRepository = bankDetailsRepository;
  }

  async getWithdrawStats(): Promise<AdminWithdrawalStatsDTO> {
    return await this._contractTransactionRepository.getWithdrawStatsForAdmin();
  }

  async getWithdrawals(page: number, limit: number, role?: string, status?: string): Promise<{ items: AdminWithdrawDTO[]; total: number }> {
    try {
      const transactions = await this._contractTransactionRepository.findWithdrawalsForAdmin(page, limit, role, status);
      const total = await this._contractTransactionRepository.countWithdrawalsForAdmin(role, status);

      const results: AdminWithdrawDTO[] = [];

      for (const tx of transactions) {
        const fidAny = (tx.freelancerId as any) || null;
        let freelancerId: string | undefined;

        if (fidAny) {
          if (typeof fidAny === 'string') {
            freelancerId = fidAny;
          } else if (fidAny._id) {
            freelancerId = fidAny._id.toString();
          } else if (typeof fidAny.toString === 'function') {
            const s = fidAny.toString();
            if (/^[a-fA-F0-9]{24}$/.test(s)) freelancerId = s;
          }
        }

        const freelancer = freelancerId ? await this._userRepository.findById(freelancerId) : null;
        const bankDetails = freelancerId ? await this._bankDetailsRepository.findByUserId(freelancerId) : null;

        const dto = mapContractTransactionToAdminWithdrawDTO(tx, freelancer || null, bankDetails || null);
        results.push(dto);
      }

      return { items: results, total };
    } catch (err) {
      throw new AppError(ERROR_MESSAGES.GENERAL.SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
