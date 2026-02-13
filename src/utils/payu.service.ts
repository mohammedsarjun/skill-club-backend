import crypto from 'crypto';

export class PayUService {
  private merchantKey: string;
  private merchantSalt: string;
  private payuUrl: string;

  constructor() {
    this.merchantKey = process.env.PAYU_MERCHANT_KEY || '';
    this.merchantSalt = process.env.PAYU_MERCHANT_SALT || '';
    this.payuUrl = process.env.PAYU_URL || 'https://test.payu.in/_payment';

    if (!this.merchantKey || !this.merchantSalt) {
      throw new Error('PayU merchant credentials not configured');
    }
  }

  /**
   * -------------------------------------------------------------------
   * 1) GENERATE HASH FOR PAYMENT REQUEST (Frontend Redirect)
   * Official PayU Sequence:
   *
   * key|txnid|amount|productinfo|firstname|email|
   * udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|SALT
   * -------------------------------------------------------------------
   */
  generateHash(params: {
    key: string;
    txnid: string;
    amount: string;
    productinfo: string;
    firstname: string;
    email: string;
    udf1?: string;
    udf2?: string;
    udf3?: string;
    udf4?: string;
    udf5?: string;
  }): string {
    const {
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      udf1 = '',
      udf2 = '',
      udf3 = '',
      udf4 = '',
      udf5 = '',
    } = params;

    // UDF6–UDF10 must exist as empty strings — PayU requirement
    const hashString =
      key +
      '|' +
      txnid +
      '|' +
      amount +
      '|' +
      productinfo +
      '|' +
      firstname +
      '|' +
      email +
      '|' +
      udf1 +
      '|' +
      udf2 +
      '|' +
      udf3 +
      '|' +
      udf4 +
      '|' +
      udf5 +
      '|' +
      '' +
      '|' +
      '' +
      '|' +
      '' +
      '|' +
      '' +
      '|' +
      '' +
      '|' +
      this.merchantSalt;

    return crypto.createHash('sha512').update(hashString).digest('hex');
  }

  /**
   * -------------------------------------------------------------------
   * 2) VERIFY CALLBACK HASH
   * Official PayU Callback Sequence (REVERSE ORDER for UDFs):
   *
   * SALT|status|
   * ||||||||||udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|
   * email|firstname|productinfo|amount|txnid|key
   *
   * Note: UDF fields are in REVERSE order compared to request hash!
   * -------------------------------------------------------------------
   */
  verifyHash(params: {
    status: string;
    key: string; // MUST use PayU callback key, DO NOT USE merchant key
    txnid: string;
    amount: string;
    productinfo: string;
    firstname: string;
    email: string;
    udf1?: string;
    udf2?: string;
    udf3?: string;
    udf4?: string;
    udf5?: string;
    udf6?: string;
    udf7?: string;
    udf8?: string;
    udf9?: string;
    udf10?: string;
    hash: string;
  }): boolean {
    const {
      status,
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      udf1 = '',
      udf2 = '',
      udf3 = '',
      udf4 = '',
      udf5 = '',
      udf6 = '',
      udf7 = '',
      udf8 = '',
      udf9 = '',
      udf10 = '',
      hash,
    } = params;

    // PayU reverses UDF order for response hash (udf10 to udf1, not udf1 to udf10)
    // Standard format: SALT|status|udf10|udf9|...|udf1|email|firstname|productinfo|amount|txnid|key
    const hashString =
      this.merchantSalt +
      '|' +
      status +
      '|' +
      udf10 +
      '|' +
      udf9 +
      '|' +
      udf8 +
      '|' +
      udf7 +
      '|' +
      udf6 +
      '|' +
      udf5 +
      '|' +
      udf4 +
      '|' +
      udf3 +
      '|' +
      udf2 +
      '|' +
      udf1 +
      '|' +
      email +
      '|' +
      firstname +
      '|' +
      productinfo +
      '|' +
      amount +
      '|' +
      txnid +
      '|' +
      key;

    const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

    return calculatedHash === hash;
  }

  getMerchantKey(): string {
    return this.merchantKey;
  }

  getPayUUrl(): string {
    return this.payuUrl;
  }
}
