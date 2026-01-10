import { SupportedCurrency } from '../contants/currency.constants';

type RateCache = {
  rateToUSD: number;
  fetchedAt: number;
};

const RATE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const cache = new Map<SupportedCurrency, RateCache>();

export async function getUsdRateFor(currency: SupportedCurrency): Promise<number> {
  if (currency === 'USD') return 1;

  const now = Date.now();
  const cached = cache.get(currency);
  if (cached && now - cached.fetchedAt < RATE_TTL_MS) return cached.rateToUSD;

  // Determine fetch function (global fetch for Node 18+, dynamic import otherwise)
  type FetchFn = (input: string, init?: RequestInit) => Promise<Response>;
  let fetchFn: FetchFn;
  if (typeof globalThis.fetch === 'function') {
    fetchFn = globalThis.fetch.bind(globalThis) as FetchFn;
  } else {
    // dynamic import of node-fetch (ESM). Cast to any to keep compatibility.
    // Note: this may throw if node-fetch isn't available; propagate that error.

    const nodeFetch = (await import('node-fetch')).default as unknown as FetchFn;
    fetchFn = nodeFetch;
  }

  // Primary provider
  const primaryUrl = `https://api.exchangerate.host/latest?base=${encodeURIComponent(
    currency,
  )}&symbols=USD`;

  let rate: number | undefined;
  let primaryPayload: { rates?: { USD?: number }; error?: string } | null = null;

  interface FxApiResponse {
    rates?: { USD?: number };
  }

  try {
    const res = await fetchFn(primaryUrl);
    if (res && typeof res.ok === 'boolean' ? res.ok : true) {
      // node-fetch Response has .json(), browser fetch too
      const json = (await res.json()) as FxApiResponse;
      primaryPayload = json;
      rate = json?.rates?.USD;
    }
  } catch (e) {
    // swallow and try fallback
    primaryPayload = { error: String(e) };
  }

  // Fallback provider
  if (typeof rate !== 'number') {
    try {
      const fallbackUrl = `https://open.er-api.com/v6/latest/${encodeURIComponent(currency)}`;
      const fres = await fetchFn(fallbackUrl);
      if (fres && (typeof fres.ok === 'boolean' ? fres.ok : true)) {
        const fjson = (await fres.json()) as FxApiResponse;
        rate = fjson?.rates?.USD;
        if (typeof rate === 'number') {
          cache.set(currency, { rateToUSD: rate, fetchedAt: now });
          return rate;
        }
      }
    } catch (e) {
      // swallow, will throw below
    }
  } else {
    cache.set(currency, { rateToUSD: rate, fetchedAt: now });
    return rate;
  }

  // If we get here, neither provider returned a usable rate
  const payload = primaryPayload ? JSON.stringify(primaryPayload).slice(0, 2000) : 'no-payload';
  throw new Error(`Invalid FX response for ${currency}: ${payload}`);
}
