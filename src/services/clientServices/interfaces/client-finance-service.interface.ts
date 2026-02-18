import type {
  ClientFinanceDTO,
  ClientTransactionDTO,
} from '../../../dto/clientDTO/client-finance.dto';

export interface IClientFinanceService {
  getFinanceData(clientId: string): Promise<ClientFinanceDTO>;
  requestWithdrawal(clientId: string, amount: number, note?: string): Promise<ClientTransactionDTO>;
  getWithdrawalHistory(
    clientId: string,
    page: number,
    limit: number,
  ): Promise<{ items: ClientTransactionDTO[]; total: number }>;
}
