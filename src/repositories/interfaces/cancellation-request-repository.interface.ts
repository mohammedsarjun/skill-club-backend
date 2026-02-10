import { ClientSession } from 'mongoose';
import { ICancellationRequest } from '../../models/interfaces/cancellation-request.model.interface';

export interface ICancellationRequestRepository {
  create(data: Partial<ICancellationRequest>, session?: ClientSession): Promise<ICancellationRequest>;
  findById(id: string): Promise<ICancellationRequest | null>;
  findByContractId(contractId: string): Promise<ICancellationRequest | null>;
  updateStatus(id: string, status: ICancellationRequest['status'], respondedBy?: string, responseMessage?: string, session?: ClientSession): Promise<ICancellationRequest | null>;
  findPendingByContractId(contractId: string): Promise<ICancellationRequest | null>;
}
