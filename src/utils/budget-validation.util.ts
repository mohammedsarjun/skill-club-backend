import AppError from './app-error';
import { HttpStatus } from '../enums/http-status.enum';
import { SupportedCurrency } from '../contants/currency.constants';

interface HourlyRate {
  min: number;
  max: number;
  hoursPerWeek: number;
  estimatedDuration: '1 To 3 Months' | '3 To 6 Months';
}

interface FixedRate {
  min: number;
  max: number;
}

interface BudgetValidationResult {
  conversionRate: number;
  hourlyRateBaseUSD?: { min: number; max: number };
  fixedRateBaseUSD?: { min: number; max: number };
}

export async function validateHourlyBudget(
  rateToUSD: number,
  hourlyRate: HourlyRate,
  currency: SupportedCurrency,
): Promise<BudgetValidationResult> {
  // Convert USD limits to local currency for validation
  const toLocal = (usd: number) => (rateToUSD > 0 ? usd * rateToUSD : usd);

  const minLocal = toLocal(5);
  const maxLocal = toLocal(999);

  if (hourlyRate.min < minLocal) {
    throw new AppError(
      `Minimum hourly rate must be at least ${minLocal.toFixed(2)} ${currency}`,
      HttpStatus.BAD_REQUEST,
    );
  }

  if (hourlyRate.max < minLocal) {
    throw new AppError(
      `Maximum hourly rate must be at least ${minLocal.toFixed(2)} ${currency}`,
      HttpStatus.BAD_REQUEST,
    );
  }

  if (hourlyRate.max < hourlyRate.min) {
    throw new AppError(
      'Maximum hourly rate must be greater than or equal to minimum rate',
      HttpStatus.BAD_REQUEST,
    );
  }

  if (hourlyRate.min > maxLocal || hourlyRate.max > maxLocal) {
    throw new AppError(
      `Hourly rate cannot exceed ${maxLocal.toFixed(2)} ${currency}`,
      HttpStatus.BAD_REQUEST,
    );
  }

  const minUSD = hourlyRate.min / rateToUSD;
  const maxUSD = hourlyRate.max / rateToUSD;

  return {
    conversionRate: rateToUSD,
    hourlyRateBaseUSD: { min: minUSD, max: maxUSD },
  };
}

export async function validateFixedBudget(
  rateToUSD: number,
  fixedRate: FixedRate,
  currency: SupportedCurrency,
): Promise<BudgetValidationResult> {
  // Convert USD limits to local currency for validation
  const toLocal = (usd: number) => (rateToUSD > 0 ? usd * rateToUSD : usd);

  const minLocal = toLocal(5);
  const maxLocal = toLocal(100000);

  if (fixedRate.min < minLocal) {
    throw new AppError(
      `Minimum budget must be at least ${minLocal.toFixed(2)} ${currency}`,
      HttpStatus.BAD_REQUEST,
    );
  }

  if (fixedRate.max < minLocal) {
    throw new AppError(
      `Maximum budget must be at least ${minLocal.toFixed(2)} ${currency}`,
      HttpStatus.BAD_REQUEST,
    );
  }

  if (fixedRate.max < fixedRate.min) {
    throw new AppError(
      'Maximum budget must be greater than or equal to minimum budget',
      HttpStatus.BAD_REQUEST,
    );
  }

  if (fixedRate.min > maxLocal || fixedRate.max > maxLocal) {
    throw new AppError(
      `Budget cannot exceed ${maxLocal.toFixed(2)} ${currency}`,
      HttpStatus.BAD_REQUEST,
    );
  }

  const minUSD = fixedRate.min / rateToUSD;
  const maxUSD = fixedRate.max / rateToUSD;

  return {
    conversionRate: rateToUSD,
    fixedRateBaseUSD: { min: minUSD, max: maxUSD },
  };
}
