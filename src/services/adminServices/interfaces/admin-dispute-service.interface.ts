import {
  AdminDisputeQueryParamsDTO,
  AdminDisputeListResultDTO,
  AdminDisputeDetailDTO,
} from '../../../dto/adminDTO/admin-dispute.dto';
import { SplitDisputeFundsDTO, SplitDisputeFundsResponseDTO } from '../../../dto/adminDTO/admin-split-dispute-funds.dto';

export interface IAdminDisputeService {
  getAllDisputes(query: AdminDisputeQueryParamsDTO): Promise<AdminDisputeListResultDTO>;
  getDisputeById(disputeId: string): Promise<AdminDisputeDetailDTO>;
  splitDisputeFunds(disputeId: string, data: SplitDisputeFundsDTO): Promise<SplitDisputeFundsResponseDTO>;
  releaseHoldHourly(disputeId: string): Promise<void>;
}
