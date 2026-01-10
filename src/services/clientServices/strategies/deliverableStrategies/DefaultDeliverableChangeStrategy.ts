import { IDeliverableChangeStrategy } from './IDeliverableChangeStrategy';
import { IContract, ContractDeliverable } from '../../../../models/interfaces/contract.model.interface';

export class DefaultDeliverableChangeStrategy implements IDeliverableChangeStrategy {
  supports(_type: string): boolean {
    return true; 
  }

  getAllowedRevisions(contract: IContract, _deliverable: ContractDeliverable): number {
    return contract.revisionAllowed ?? 0;
  }
}
