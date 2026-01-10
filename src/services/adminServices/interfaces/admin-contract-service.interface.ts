import {
  AdminContractQueryParamsDTO,
  AdminContractListResultDTO,
  AdminContractDetailDTO,
} from '../../../dto/adminDTO/admin-contract.dto';

export interface IAdminContractService {
  getAllContracts(query: AdminContractQueryParamsDTO): Promise<AdminContractListResultDTO>;
  getContractDetail(contractId: string): Promise<AdminContractDetailDTO>;
}
