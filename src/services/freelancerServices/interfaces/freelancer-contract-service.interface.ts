import {
  FreelancerContractListResultDTO,
  FreelancerContractQueryParamsDTO,
  FreelancerContractDetailDTO,
} from '../../../dto/freelancerDTO/freelancer-contract.dto';
import {
  DeliverableResponseDTO,
  SubmitDeliverableDTO,
} from '../../../dto/freelancerDTO/freelancer-deliverable.dto';
import {
  SubmitMilestoneDeliverableDTO,
  RequestMilestoneExtensionDTO,
  MilestoneDeliverableResponseDTO,
  MilestoneExtensionResponseDTO,
} from '../../../dto/freelancerDTO/freelancer-milestone.dto';
import {
  RequestContractExtensionDTO,
  ContractExtensionResponseDTO,
} from '../../../dto/freelancerDTO/freelancer-contract-extension.dto';

export interface IFreelancerContractService {
  getAllContracts(
    freelancerId: string,
    query: FreelancerContractQueryParamsDTO,
  ): Promise<FreelancerContractListResultDTO>;
  getContractDetail(freelancerId: string, contractId: string): Promise<FreelancerContractDetailDTO>;
  submitDeliverable(
    freelancerId: string,
    contractId: string,
    data: SubmitDeliverableDTO,
  ): Promise<DeliverableResponseDTO>;
  submitMilestoneDeliverable(
    freelancerId: string,
    contractId: string,
    data: SubmitMilestoneDeliverableDTO,
  ): Promise<MilestoneDeliverableResponseDTO>;
  requestMilestoneExtension(
    freelancerId: string,
    contractId: string,
    data: RequestMilestoneExtensionDTO,
  ): Promise<MilestoneExtensionResponseDTO>;
  requestContractExtension(
    freelancerId: string,
    contractId: string,
    data: RequestContractExtensionDTO,
  ): Promise<ContractExtensionResponseDTO>;
  cancelContract(freelancerId: string, contractId: string): Promise<{ cancelled: boolean; requiresDispute: boolean }>;
}
