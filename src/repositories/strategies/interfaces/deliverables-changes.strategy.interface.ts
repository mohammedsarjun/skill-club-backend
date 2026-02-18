import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import { IContract } from '../../../models/interfaces/contract.model.interface';

export interface DeliverableChangeParams {
  contractId: string;
  deliverableId: string;
  message: string;
  milestoneId?: string;
}

interface UpdateQueryResult {
  filter: FilterQuery<IContract>;
  update: UpdateQuery<IContract>;
  options: QueryOptions;
}

export interface IDeliverablesChangeQueryStrategy {
  supports(type: string): boolean;
  buildQuery(params: DeliverableChangeParams): UpdateQueryResult;
}
