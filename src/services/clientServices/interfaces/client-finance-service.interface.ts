import type { ClientFinanceDTO } from '../../../dto/clientDTO/client-finance.dto';

export interface IClientFinanceService {
  getFinanceData(clientId: string): Promise<ClientFinanceDTO>;
  requestWithdrawal(clientId: string, amount: number, note?: string): Promise<any>;
  getWithdrawalHistory(clientId: string, page: number, limit: number): Promise<{items: import('../../../dto/clientDTO/client-finance.dto').ClientTransactionDTO[]; total: number}>;
}
