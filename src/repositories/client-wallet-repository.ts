import { injectable } from 'tsyringe';
import BaseRepository from './baseRepositories/base-repository';
import { IClientWallet } from '../models/interfaces/client-wallet.model.interface';
import { ClientWallet } from '../models/client-wallet.model';
import { IClientWalletRepository } from './interfaces/client-wallet-repository.interface';
import { ClientSession, Types } from 'mongoose';

@injectable()
export class ClientWalletRepository
  extends BaseRepository<IClientWallet>
  implements IClientWalletRepository
{
  constructor() {
    super(ClientWallet);
  }

  async findByClientId(clientId: string): Promise<IClientWallet | null> {
    return await super.findOne({ clientId: new Types.ObjectId(clientId) });
  }

  async createWallet(clientId: string, session?: ClientSession): Promise<IClientWallet> {
    return await super.create(
      {
        clientId: new Types.ObjectId(clientId),
        balance: 0,
        totalFunded: 0,
        totalRefunded: 0,
      } as Partial<IClientWallet>,
      session,
    );
  }

  async updateBalance(
    clientId: string,
    amount: number,
    session?: ClientSession,
  ): Promise<IClientWallet | null> {
    return await super.update(
      { clientId: new Types.ObjectId(clientId) },
      { $inc: { balance: amount } },
      session,
    );
  }

  async incrementTotalFunded(
    clientId: string,
    amount: number,
    session?: ClientSession,
  ): Promise<IClientWallet | null> {
    return await super.update(
      { clientId: new Types.ObjectId(clientId) },
      { $inc: { totalFunded: amount } },
      session,
    );
  }

  async incrementTotalRefunded(
    clientId: string,
    amount: number,
    session?: ClientSession,
  ): Promise<IClientWallet | null> {
    return await super.update(
      { clientId: new Types.ObjectId(clientId) },
      { $inc: { totalRefunded: amount } },
      session,
    );
  }
}
