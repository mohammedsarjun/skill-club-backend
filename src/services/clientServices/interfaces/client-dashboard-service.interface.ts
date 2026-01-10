import type { ClientDashboardDTO } from '../../../dto/clientDTO/client-dashboard.dto';

export interface IClientDashboardService {
  getDashboardData(clientId: string): Promise<ClientDashboardDTO>;
}
