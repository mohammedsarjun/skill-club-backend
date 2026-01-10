import type { ClientFinanceDTO } from '../../../dto/clientDTO/client-finance.dto';

export interface IClientFinanceService {
  getFinanceData(clientId: string): Promise<ClientFinanceDTO>;
}
