import { injectable } from 'tsyringe';
import { IContractCancellationStrategy, CancellationResult } from './IContractCancellationStrategy';
import { IContract } from '../../../../models/interfaces/contract.model.interface';

@injectable()
export class HourlyContractCancellationStrategy implements IContractCancellationStrategy {
  supports(paymentType: string): boolean {
    return paymentType === 'hourly';
  }

  processCancellation(contract: IContract, totalFunded: number): CancellationResult {
    const hasTimesheets = contract.timesheets && contract.timesheets.length > 0;

    if (!hasTimesheets) {
      return {
        requiresRefund: true,
        refundAmount: totalFunded,
        requiresDispute: false,
      };
    }

    const hasPendingTimesheets = contract.timesheets?.some((t) => t.status === 'pending');
    const hasApprovedTimesheets = contract.timesheets?.some(
      (t) => t.status === 'approved' || t.status === 'paid',
    );

    if (hasPendingTimesheets || hasApprovedTimesheets) {
      return {
        requiresRefund: false,
        requiresDispute: true,
      };
    }

    return {
      requiresRefund: true,
      refundAmount: totalFunded,
      requiresDispute: false,
    };
  }
}
