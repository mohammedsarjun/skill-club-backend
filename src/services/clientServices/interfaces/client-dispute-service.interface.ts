import {
  CreateDisputeRequestDTO,
  DisputeResponseDTO,
} from '../../../dto/clientDTO/client-dispute.dto';

export interface IClientDisputeService {
  createDispute(clientId: string, data: CreateDisputeRequestDTO): Promise<DisputeResponseDTO>;
  getDisputeById(clientId: string, disputeId: string): Promise<DisputeResponseDTO>;
  getDisputesByContract(clientId: string, contractId: string): Promise<DisputeResponseDTO[]>;
  cancelContractWithDispute(
    clientId: string,
    contractId: string,
    reasonCode: string,
    description: string,
  ): Promise<DisputeResponseDTO>;
}
