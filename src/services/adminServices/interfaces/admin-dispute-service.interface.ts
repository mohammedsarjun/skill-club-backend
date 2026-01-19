import {
  AdminDisputeQueryParamsDTO,
  AdminDisputeListResultDTO,
  AdminDisputeDetailDTO,
} from '../../../dto/adminDTO/admin-dispute.dto';

export interface IAdminDisputeService {
  getAllDisputes(query: AdminDisputeQueryParamsDTO): Promise<AdminDisputeListResultDTO>;
  getDisputeById(disputeId: string): Promise<AdminDisputeDetailDTO>;
}
