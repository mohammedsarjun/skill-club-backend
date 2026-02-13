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
export class MilestoneDeliverablesChangeQueryStrategy implements IDeliverablesChangeQueryStrategy {
  supports(type: string): boolean {
    return type === 'milestone';
  }

  buildQuery(params: DeliverableChangeParams): UpdateQueryResult {
    const { contractId, milestoneId, message } = params;

    return {
      filter: {
        _id: contractId,
      },

      update: {
        $set: {
          'milestones.$[milestone].status': 'changes_requested',
          'milestones.$[milestone].message': message,
          status: 'changes_requested',
        },
        $inc: {
          'milestones.$[milestone].revisionsRequested': 1,
        },
      },

      options: {
        new: true,
        arrayFilters: [{ 'milestone._id': milestoneId }],
      },
    };
  }
}
