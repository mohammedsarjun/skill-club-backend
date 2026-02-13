import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IBlacklistedTokenService } from './interfaces/blacklisted-token-service.interface';
import { IBlacklistedTokenRepository } from '../../repositories/interfaces/blacklisted-token-repository.interface';
import { IBlacklistedToken } from '../../models/interfaces/blacklisted-token.interface';

@injectable()
export class BlacklistedTokenService implements IBlacklistedTokenService {
  private _blacklistedTokenRepository: IBlacklistedTokenRepository;

  constructor(
    @inject('IBlacklistedTokenRepository') blacklistedTokenRepository: IBlacklistedTokenRepository,
  ) {
    this._blacklistedTokenRepository = blacklistedTokenRepository;
  }

  async addTokenToBlacklist(token: string, expiresAt: Date): Promise<IBlacklistedToken> {
    const blacklistedToken = await this._blacklistedTokenRepository.addToken(token, expiresAt);
    return blacklistedToken;
  }

  async findBlacklistedToken(token: string): Promise<IBlacklistedToken | null> {
    return this._blacklistedTokenRepository.findByToken(token);
  }
}
