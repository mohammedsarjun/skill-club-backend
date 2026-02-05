import { UserBankDTO } from '../../../dto/commonDTO/user-bank.dto';

export interface IClientBankService {
  getBankDetails(clientId: string): Promise<UserBankDTO | null>;
  saveBankDetails(clientId: string, data: Partial<UserBankDTO>): Promise<UserBankDTO>;
}
