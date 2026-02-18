import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import {
  DeliverableChangeParams,
  IDeliverablesChangeQueryStrategy,
} from './interfaces/deliverables-changes.strategy.interface';
import { IContract } from '../../models/interfaces/contract.model.interface';
import { injectable } from 'tsyringe';

interface UpdateQueryResult {
  filter: FilterQuery<IContract>;
  update: UpdateQuery<IContract>;
  options: QueryOptions;
}

@injectable()
export class FixedDeliverablesChangeQueryStrategy implements IDeliverablesChangeQueryStrategy {
  supports(type: string): boolean {
    return type === 'fixed';
  }

  buildQuery(params: DeliverableChangeParams): UpdateQueryResult {
    const { contractId, deliverableId, message } = params;

    return {
      filter: {
        _id: contractId,
      },

      update: {
        $set: {
          'deliverables.$[elem].status': 'changes_requested',
          'deliverables.$[elem].message': message,
        },
        $inc: {
          revisionAllowed: -1,
        },
      },

      options: {
        new: true,
        arrayFilters: [{ 'elem._id': deliverableId }],
      },
    };
  }
}
