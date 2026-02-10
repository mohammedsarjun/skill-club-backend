import { IDispute } from '../../models/interfaces/dispute.model.interface';
import { AdminDisputeQueryParamsDTO } from '../../dto/adminDTO/admin-dispute.dto';

export interface IDisputeRepository {
  createDispute(data: Partial<IDispute>): Promise<IDispute>;
  findDisputeById(disputeId: string): Promise<IDispute | null>;
  findDisputesByContractId(contractId: string): Promise<IDispute[]>;
  findActiveDisputeByContract(contractId: string): Promise<IDispute | null>;
  findActiveDisputeByWorklog(worklogId: string): Promise<IDispute | null>;
  updateDisputeStatus(
    disputeId: string,
    status: 'open' | 'under_review' | 'resolved' | 'rejected',
  ): Promise<IDispute | null>;
  resolveDispute(
    disputeId: string,
    resolution: {
      outcome: 'refund_client' | 'pay_freelancer' | 'split';
      clientAmount: number;
      freelancerAmount: number;
      decidedBy: 'admin' | 'system';
    },
  ): Promise<IDispute | null>;
  findAllForAdmin(query: AdminDisputeQueryParamsDTO): Promise<IDispute[]>;
  countForAdmin(query: AdminDisputeQueryParamsDTO): Promise<number>;
  findDisputeByDisputeId(disputeId: string): Promise<IDispute | null>;
  updateDisputeStatusByDisputeId(
    disputeId: string,
    status: 'open' | 'under_review' | 'resolved' | 'rejected',
  ): Promise<IDispute | null>;
}
