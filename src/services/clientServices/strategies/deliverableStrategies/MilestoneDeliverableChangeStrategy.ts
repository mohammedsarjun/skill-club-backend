import { IDeliverableChangeStrategy } from './IDeliverableChangeStrategy';
import { IContract, ContractDeliverable } from '../../../../models/interfaces/contract.model.interface';

export class MilestoneDeliverableChangeStrategy implements IDeliverableChangeStrategy {
  supports(type: string): boolean {
    return type === 'fixed_with_milestones';
  }

  getAllowedRevisions(contract: IContract, deliverable: ContractDeliverable): number {
    const idx = Math.max(0, (deliverable.version || 1) - 1);
    const milestone = contract.milestones ? contract.milestones[idx] : undefined;
    return milestone?.revisionsAllowed ?? 0;
  }
}
