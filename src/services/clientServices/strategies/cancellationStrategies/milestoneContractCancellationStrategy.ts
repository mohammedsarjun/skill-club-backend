import { injectable } from 'tsyringe';
import { IContractCancellationStrategy, CancellationResult } from './IContractCancellationStrategy';
import { IContract } from '../../../../models/interfaces/contract.model.interface';

@injectable()
export class MilestoneContractCancellationStrategy implements IContractCancellationStrategy {
  supports(paymentType: string): boolean {
    return paymentType === 'fixed_with_milestones';
  }

  processCancellation(contract: IContract, totalFunded: number): CancellationResult {
    const hasMilestones = contract.milestones && contract.milestones.length > 0;

    if (!hasMilestones) {
      return {
        requiresRefund: true,
        refundAmount: totalFunded,
        requiresDispute: false,
      };
    }

    const hasPaidMilestones = contract.milestones?.some(m => m.status === 'paid');
    const hasFundedMilestones = contract.milestones?.some(m => m.status === 'funded');
    const hasSubmittedMilestones = contract.milestones?.some(
      m => m.deliverables && m.deliverables.some(d => d.status === 'submitted' || d.status === 'approved')
    );

    if (hasPaidMilestones || hasSubmittedMilestones) {
      return {
        requiresRefund: false,
        requiresDispute: true,
      };
    }

    if (hasFundedMilestones) {
      return {
        requiresRefund: true,
        refundAmount: totalFunded,
        requiresDispute: false,
      };
    }

    return {
      requiresRefund: true,
      refundAmount: totalFunded,
      requiresDispute: false,
    };
  }
}
