import {
  IPaymentAmountStrategy,
  PaymentCalculationContext,
} from './interfaces/IPaymentAmountStrategy';
import AppError from '../../../../utils/app-error';
import { HttpStatus } from '../../../../enums/http-status.enum';

export class FixedPaymentStrategy implements IPaymentAmountStrategy {
  supports(type: string): boolean {
    return type === 'fixed';
  }

  calculate(context: PaymentCalculationContext): number {
    if (!context.contract.budget) {
      throw new AppError('Contract budget not defined', HttpStatus.BAD_REQUEST);
    }
    return context.contract.budget;
  }
}
