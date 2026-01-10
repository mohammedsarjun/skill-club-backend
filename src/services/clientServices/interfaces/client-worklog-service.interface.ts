import {
  ClientWorklogQueryParamsDTO,
  ClientWorklogListResultDTO,
  ClientWorklogDetailDTO,
  ApproveWorklogDTO,
  RejectWorklogDTO,
} from '../../../dto/clientDTO/client-worklog.dto';

export interface IClientWorklogService {
  getWorklogsByContract(
    clientId: string,
    contractId: string,
    query: ClientWorklogQueryParamsDTO
  ): Promise<ClientWorklogListResultDTO>;
  getWorklogDetail(clientId: string, contractId: string, worklogId: string): Promise<ClientWorklogDetailDTO>;
  approveWorklog(clientId: string, contractId: string, data: ApproveWorklogDTO): Promise<ClientWorklogDetailDTO>;
  rejectWorklog(clientId: string, contractId: string, data: RejectWorklogDTO): Promise<ClientWorklogDetailDTO>;
  autoPayWorkLog(): Promise<void>;
}
