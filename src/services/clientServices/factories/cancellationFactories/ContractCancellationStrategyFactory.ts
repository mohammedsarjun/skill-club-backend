import { injectable, injectAll } from 'tsyringe';
import AppError from '../../../../utils/app-error';
import { HttpStatus } from '../../../../enums/http-status.enum';
import { IContractCancellationStrategy } from '../../strategies/cancellationStrategies/IContractCancellationStrategy';

@injectable()
export class ContractCancellationStrategyFactory {
  private readonly strategies: IContractCancellationStrategy[];

  constructor(
    @injectAll('IContractCancellationStrategy') strategies: IContractCancellationStrategy[],
  ) {
    this.strategies = strategies;
  }

  getStrategy(paymentType: string): IContractCancellationStrategy {
    const strategy = this.strategies.find((s) => s.supports(paymentType));
    if (!strategy) {
      throw new AppError(
        'Unsupported payment type for contract cancellation',
        HttpStatus.BAD_REQUEST,
      );
    }
    return strategy;
  }
}
