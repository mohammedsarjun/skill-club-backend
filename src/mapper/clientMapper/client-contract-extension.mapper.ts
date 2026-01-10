import { ContractExtensionRequest } from '../../models/interfaces/contract.model.interface';
import { ContractExtensionResponseDTO } from '../../dto/clientDTO/client-contract-extension.dto';

export class ClientContractExtensionMapper {
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
