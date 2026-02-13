import AppError from '../../../../utils/app-error';
import { IPaymentAmountStrategy } from '../../strategies/paymentStrategies/interfaces/IPaymentAmountStrategy';
import { HttpStatus } from '../../../../enums/http-status.enum';
import { injectable, injectAll } from 'tsyringe';

@injectable()
export class PaymentAmountStrategyFactory {
  private readonly strategies: IPaymentAmountStrategy[];
  constructor(@injectAll('IPaymentAmountStrategy') strategies: IPaymentAmountStrategy[]) {
    this.strategies = strategies;
  }

  getStrategy(type: string): IPaymentAmountStrategy {
    const strategy = this.strategies.find((s) => s.supports(type));
    if (!strategy) {
      throw new AppError('Unsupported payment type', HttpStatus.BAD_REQUEST);
    }
    return strategy;
  }
}
