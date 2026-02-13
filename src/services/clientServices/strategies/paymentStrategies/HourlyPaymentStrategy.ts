import {
  IPaymentAmountStrategy,
  PaymentCalculationContext,
} from './interfaces/IPaymentAmountStrategy';
import AppError from '../../../../utils/app-error';
import { HttpStatus } from '../../../../enums/http-status.enum';

export class HourlyPaymentStrategy implements IPaymentAmountStrategy {
  supports(type: string): boolean {
    return type === 'hourly';
  }

  calculate(context: PaymentCalculationContext): number {
    if (!context.contract.hourlyRate || !context.contract.estimatedHoursPerWeek) {
      throw new AppError(
        'Contract hourly rate or estimated hours not defined',
        HttpStatus.BAD_REQUEST,
      );
    }
    return context.contract.hourlyRate * context.contract.estimatedHoursPerWeek;
  }
}
