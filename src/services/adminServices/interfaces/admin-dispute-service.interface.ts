import {
  AdminDisputeQueryParamsDTO,
  AdminDisputeListResultDTO,
} from '../../../dto/adminDTO/admin-dispute.dto';

export interface IAdminDisputeService {
  getAllDisputes(query: AdminDisputeQueryParamsDTO): Promise<AdminDisputeListResultDTO>;
}
