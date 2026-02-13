import {
  IContract,
  ContractDeliverable,
} from '../../../../models/interfaces/contract.model.interface';

export interface IDeliverableChangeStrategy {
  supports(type: string): boolean;
  getAllowedRevisions(contract: IContract, deliverable: ContractDeliverable): number;
}
