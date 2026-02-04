import { ClientBankDTO } from '../../../dto/clientDTO/client-bank.dto';

export interface IClientBankService {
  getBankDetails(clientId: string): Promise<ClientBankDTO | null>;
  saveBankDetails(clientId: string, data: Partial<ClientBankDTO>): Promise<ClientBankDTO>;
}
