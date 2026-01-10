export interface IGetRatesService {
  /**
   * Returns exchange rates for supported currencies relative to `base`.
   * Result: { [currency]: rate } meaning 1 base = rate * currency
   */
  getRates(base?: string): Promise<Record<string, number>>;
}

// Use named export (no default) — container and other modules import the interface by name.
export interface IGetRatesService {
  getRates(base?: string): Promise<Record<string, number>>;
}

export default IGetRatesService;
