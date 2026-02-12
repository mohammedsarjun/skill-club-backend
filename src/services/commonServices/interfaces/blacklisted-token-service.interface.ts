import { IBlacklistedToken } from '../../../models/interfaces/blacklisted-token.interface';

export interface IBlacklistedTokenService {
  addTokenToBlacklist(token: string, expiresAt: Date): Promise<IBlacklistedToken>;
  findBlacklistedToken(token: string): Promise<IBlacklistedToken | null>;
}
