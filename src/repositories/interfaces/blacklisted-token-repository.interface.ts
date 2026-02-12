import BaseRepository from '../baseRepositories/base-repository';
import { IBlacklistedToken } from '../../models/interfaces/blacklisted-token.interface';

export interface IBlacklistedTokenRepository extends BaseRepository<IBlacklistedToken> {
  addToken(token: string, expiresAt: Date): Promise<IBlacklistedToken>;
  findByToken(token: string): Promise<IBlacklistedToken | null>;
}
