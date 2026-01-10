import { ContractExtensionRequest } from '../../models/interfaces/contract.model.interface';
import { ContractExtensionResponseDTO } from '../../dto/freelancerDTO/freelancer-contract-extension.dto';

export class FreelancerContractExtensionMapper {
  static toContractExtensionResponseDTO(
    extensionRequest: ContractExtensionRequest,
  ): ContractExtensionResponseDTO {
    return {
      requestedBy: extensionRequest.requestedBy.toString(),
      requestedDeadline: extensionRequest.requestedDeadline.toISOString(),
      reason: extensionRequest.reason,
      status: extensionRequest.status,
      requestedAt: extensionRequest.requestedAt.toISOString(),
      respondedAt: extensionRequest.respondedAt?.toISOString(),
      responseMessage: extensionRequest.responseMessage,
    };
  }
}
