import {
  ClientContractDetailDTO,
  ClientContractListResultDTO,
  ClientContractQueryParamsDTO,
} from '../../../dto/clientDTO/client-contract.dto';
import {
  DeliverableResponseDTO,
  ApproveDeliverableDTO,
  RequestChangesDTO,
  DownloadDeliverableDTO,
} from '../../../dto/clientDTO/client-deliverable.dto';
import {
  ApproveMilestoneDeliverableDTO,
  RequestMilestoneChangesDTO,
  RespondToExtensionDTO,
  MilestoneDeliverableResponseDTO,
  MilestoneExtensionResponseDTO,
  ClientMilestonesDetailDTO,
} from '../../../dto/clientDTO/client-milestone.dto';
import {
  RespondToContractExtensionDTO,
  ContractExtensionResponseDTO,
} from '../../../dto/clientDTO/client-contract-extension.dto';
import { CreateCancellationRequestDTO, CancellationRequestResponseDTO } from '../../../dto/clientDTO/client-cancellation-request.dto';
import { AcceptCancellationRequestDTO } from '../../../dto/clientDTO/client-accept-cancellation-request.dto';
import archiver from 'archiver';

export interface IClientContractService {
  getContractDetail(clientId: string, contractId: string): Promise<ClientContractDetailDTO>;
  cancelContract(clientId: string, contractId: string, cancelContractReason: string): Promise<{ cancelled: boolean; requiresDispute: boolean }>;
  getAllContracts(
    clientId: string,
    query: ClientContractQueryParamsDTO,
  ): Promise<ClientContractListResultDTO>;
  approveDeliverable(
    clientId: string,
    contractId: string,
    data: ApproveDeliverableDTO,
  ): Promise<DeliverableResponseDTO>;
  requestDeliverableChanges(
    clientId: string,
    contractId: string,
    data: RequestChangesDTO,
  ): Promise<DeliverableResponseDTO>;
  approveMilestoneDeliverable(
    clientId: string,
    contractId: string,
    data: ApproveMilestoneDeliverableDTO,
  ): Promise<MilestoneDeliverableResponseDTO>;
  requestMilestoneChanges(
    clientId: string,
    contractId: string,
    data: RequestMilestoneChangesDTO,
  ): Promise<MilestoneDeliverableResponseDTO>;
  respondToMilestoneExtension(
    clientId: string,
    contractId: string,
    data: RespondToExtensionDTO,
  ): Promise<MilestoneExtensionResponseDTO>;
  respondToContractExtension(
    clientId: string,
    contractId: string,
    data: RespondToContractExtensionDTO,
  ): Promise<ContractExtensionResponseDTO>;
  getMilestoneDetail(
    clientId: string,
    contractId: string,
    milestoneId: string,
  ): Promise<ClientMilestonesDetailDTO>;
  autoApprovePendingDeliverables(): Promise<void>;
  downloadDeliverableFiles(
    clientId: string,
    contractId: string,
    data: DownloadDeliverableDTO,
  ): Promise<archiver.Archiver>;
  downloadMilestoneDeliverableFiles(
    clientId: string,
    contractId: string,
    milestoneId: string,
    data: DownloadDeliverableDTO,
  ): Promise<archiver.Archiver>;
  
  activateHourlyContract(clientId: string, contractId: string): Promise<{ activated: boolean }>;
  endHourlyContract(clientId: string, contractId: string): Promise<{ ended: boolean; message: string }>;
  createCancellationRequest(clientId: string, contractId: string, data: CreateCancellationRequestDTO): Promise<CancellationRequestResponseDTO>;
  getCancellationRequest(clientId: string, contractId: string): Promise<CancellationRequestResponseDTO | null>;
  acceptCancellationRequest(clientId: string, contractId: string, data: AcceptCancellationRequestDTO): Promise<{ success: boolean; message: string }>;
  raiseCancellationDispute(clientId: string, contractId: string, notes: string): Promise<{ success: boolean; message: string }>;
}

