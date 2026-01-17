import { injectable } from 'tsyringe';
import { IContractCancellationStrategy, CancellationResult } from './IContractCancellationStrategy';
import { IContract } from '../../../../models/interfaces/contract.model.interface';

@injectable()
export class FixedContractCancellationStrategy implements IContractCancellationStrategy {
  supports(paymentType: string): boolean {
    return paymentType === 'fixed';
  }

  processCancellation(contract: IContract, totalFunded: number): CancellationResult {
    const hasDeliverables = contract.deliverables && contract.deliverables.length > 0;

    if (!hasDeliverables) {
      return {
        requiresRefund: true,
        refundAmount: totalFunded,
        requiresDispute: false,
      };
    }

    return {
      requiresRefund: false,
      refundAmount: totalFunded,
      requiresDispute: true,
    };
  }
}
