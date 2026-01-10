import { HttpStatus } from '../../../enums/http-status.enum';
import { IDeliverablesChangeQueryStrategy } from '../../strategies/interfaces/deliverables-changes.strategy.interface';

import AppError from '../../../utils/app-error';
import { injectAll, injectable } from 'tsyringe';

@injectable()
export class DeliverableChangeQueryStrategyFactory {
  private readonly strategies: IDeliverablesChangeQueryStrategy[]

  constructor(@injectAll("IDeliverablesChangeQueryStrategy") strategies:IDeliverablesChangeQueryStrategy[]) {
    this.strategies=strategies
  }

    getStrategy(type: string): IDeliverablesChangeQueryStrategy {
    const strategy = this.strategies.find((s) => s.supports(type));
    if (!strategy) {
      throw new AppError('No strategy found for the given type',HttpStatus.NOT_FOUND);
    }
    return strategy;
}
}