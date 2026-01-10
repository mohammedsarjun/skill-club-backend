import AppError from '../../../../utils/app-error';
import { IDeliverableChangeStrategy } from '../../strategies/deliverableStrategies/IDeliverableChangeStrategy';
import { injectable, injectAll } from 'tsyringe';
import { HttpStatus } from '../../../../enums/http-status.enum';

@injectable()
export class DeliverableChangeStrategyFactory {
  private readonly strategies: IDeliverableChangeStrategy[];
  constructor(@injectAll('IDeliverableChangeStrategy') strategies: IDeliverableChangeStrategy[]) {
    this.strategies = strategies;
  }

  getStrategy(type: string): IDeliverableChangeStrategy {
    const strategy = this.strategies.find((s) => s.supports(type));
    if (!strategy) {
      throw new AppError('Unsupported payment type for deliverable change', HttpStatus.BAD_REQUEST);
    }
    return strategy;
  }
}
