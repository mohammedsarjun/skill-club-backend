import { IContract } from '../../models/interfaces/contract.model.interface';

export const calculateRequiredAmountForHourlyContract = (contract: IContract): number => {
  if (contract.paymentType !== 'hourly' || !contract.hourlyRate || !contract.estimatedHoursPerWeek) {
    return 0;
  }
  const weeklyAmount = contract.hourlyRate * contract.estimatedHoursPerWeek;
  const currentBalance = contract.balance || 0;
  const requiredAmount = weeklyAmount - currentBalance;
  return Math.max(0, requiredAmount);
};

export const isHourlyContractBalanceSufficient = (contract: IContract): boolean => {
  if (contract.paymentType !== 'hourly' || !contract.hourlyRate || !contract.estimatedHoursPerWeek) {
    return false;
  }
  const weeklyAmount = contract.hourlyRate * contract.estimatedHoursPerWeek;
  const currentBalance = contract.balance || 0;
  return currentBalance >= weeklyAmount;
};
