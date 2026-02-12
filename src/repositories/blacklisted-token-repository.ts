import BaseRepository from './baseRepositories/base-repository';
import { IBlacklistedTokenRepository } from './interfaces/blacklisted-token-repository.interface';
import BlacklistedToken from '../models/blacklisted-token';
import { IBlacklistedToken } from '../models/interfaces/blacklisted-token.interface';

export class BlacklistedTokenRepository
  extends BaseRepository<IBlacklistedToken>
  implements IBlacklistedTokenRepository
{
  constructor() {
    super(BlacklistedToken);
  }

  async addToken(token: string, expiresAt: Date): Promise<IBlacklistedToken> {
    return this.create({ token, expiresAt } as Partial<IBlacklistedToken>);
  }

  async findByToken(token: string): Promise<IBlacklistedToken | null> {
    return this.findOne({ token });
  }
}
