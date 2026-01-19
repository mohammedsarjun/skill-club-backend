import { CreateDisputeRequestDTO, DisputeResponseDTO, RaiseDisputeForCancelledContractDTO } from '../../../dto/freelancerDTO/freelancer-dispute.dto';

export interface IFreelancerDisputeService {
  createDispute(freelancerId: string, data: CreateDisputeRequestDTO): Promise<DisputeResponseDTO>;
  getDisputeById(freelancerId: string, disputeId: string): Promise<DisputeResponseDTO>;
  getDisputesByContract(freelancerId: string, contractId: string): Promise<DisputeResponseDTO[]>;
  raiseDisputeForCancelledContract(freelancerId: string, contractId: string, data: RaiseDisputeForCancelledContractDTO): Promise<DisputeResponseDTO>;
  cancelContractWithDispute(
    freelancerId: string,
    contractId: string,
    reasonCode: string,
    description: string,
  ): Promise<DisputeResponseDTO>;
}
