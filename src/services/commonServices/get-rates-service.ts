import { injectable } from 'tsyringe';
import axios from 'axios';
import { SUPPORTED_CURRENCIES } from '../../contants/currency.constants';
import { IGetRatesService } from './interfaces/get-rates-service.interface';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';

@injectable()
export class GetRatesService implements IGetRatesService {
  private cachedRates: Record<string, number> | null = null;
  private lastFetched = 0;
  private cacheBase: string | null = null;

  async getRates(base = 'USD'): Promise<Record<string, number>> {
    const oneHour = 1000 * 60 * 60;

    if (this.cachedRates && Date.now() - this.lastFetched < oneHour && this.cacheBase === base) {
      return this.cachedRates;
    }

    // Preferred provider: exchangerate.host (no key) — returns { rates: { USD: 1.0, EUR: 0.9, ... } }
    const symbols = SUPPORTED_CURRENCIES.join(',');
    const primaryUrl = `https://api.exchangerate.host/latest?base=${encodeURIComponent(
      base,
    )}&symbols=${encodeURIComponent(symbols)}`;

    let data: { rates: Record<string, number> } | null = null;
    try {
      const response = await axios.get(primaryUrl, { timeout: 5000 });
      data = response.data;
      if (!data || !data.rates) {
        data = null;
      }
    } catch (err) {
      // swallow and try fallback
      data = null;
    }

    // Fallback provider: open.er-api.com
    if (!data) {
      try {
        const fallbackUrl = `https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`;
        const fallbackResp = await axios.get(fallbackUrl, { timeout: 5000 });
        const fallbackData = fallbackResp.data;
        if (fallbackData && fallbackData.rates) {
          data = fallbackData;
        }
      } catch (err) {
        data = null;
      }
    }

    if (!data || !data.rates) {
      const payload = data ? JSON.stringify(data).slice(0, 2000) : 'no-payload';
      throw new AppError(
        `Failed to fetch rates from FX provider: ${payload}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Build rates object only for supported currencies
    const rates: Record<string, number> = {};
    for (const c of SUPPORTED_CURRENCIES) {
      const value = data.rates[c];
      if (typeof value === 'number') rates[c] = value;
    }

    // Cache with base meta to avoid mixing different bases
    this.cachedRates = rates;
    this.cacheBase = base;
    this.lastFetched = Date.now();

    return rates;
  }
}

export default GetRatesService;
