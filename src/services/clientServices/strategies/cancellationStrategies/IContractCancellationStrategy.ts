import { IContract } from '../../../../models/interfaces/contract.model.interface';

export interface CancellationResult {
  requiresRefund: boolean;
  refundAmount?: number;
  requiresDispute: boolean;
}

export interface IContractCancellationStrategy {
  supports(paymentType: string): boolean;
  processCancellation(contract: IContract, totalFunded: number): CancellationResult;
}
