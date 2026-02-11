import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IClientBankService } from './interfaces/client-bank-service.interface';
import { IBankDetailsRepository } from '../../repositories/interfaces/bank-details-repository.interface';
import { mapBankToDTO } from '../../mapper/clientMapper/client-bank.mapper';
import { UserBankDTO } from '../../dto/commonDTO/user-bank.dto';
import AppError from '../../utils/app-error';
import { ERROR_MESSAGES } from '../../contants/error-constants';

@injectable()
export class ClientBankService implements IClientBankService {
  private _bankRepository: IBankDetailsRepository;

  constructor(@inject('IBankDetailsRepository') bankRepository: IBankDetailsRepository) {
    this._bankRepository = bankRepository;
  }

  async getBankDetails(clientId: string): Promise<UserBankDTO | null> {
    const bank = await this._bankRepository.findByUserId(clientId);
    if (!bank) return null;
    return mapBankToDTO(bank as any);
  }

  async saveBankDetails(clientId: string, data: Partial<UserBankDTO>): Promise<UserBankDTO> {
    if (!data.accountHolderName || !data.bankName || !data.accountNumber || !data.ifscCode) {
      throw new AppError(ERROR_MESSAGES.BANK.INVALID_DETAILS, 400);
    }

    const saved = await this._bankRepository.createOrUpdateByUser(clientId, {
      accountHolderName: data.accountHolderName,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      ifscCode: data.ifscCode,
      accountType: data.accountType,
      verified: false,
    } as any);

    return mapBankToDTO(saved as any);
  }
}
