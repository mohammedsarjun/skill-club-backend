import { GetClientDTO, UpdateClientDto } from '../../../dto/clientDTO/client.dto';

export interface IClientService {
  getClientData(id: string): Promise<GetClientDTO>;
  updateClient(id: string, data: Partial<UpdateClientDto>): Promise<GetClientDTO>;
}
