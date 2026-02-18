import { IContract } from 'src/models/interfaces/contract.model.interface';

export interface PaymentCalculationContext {
  contract: IContract;
  milestoneId?: string;
}
export interface IPaymentAmountStrategy {
  supports(type: string): boolean;
  calculate(context: PaymentCalculationContext): number;
}
