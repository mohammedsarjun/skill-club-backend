import BaseRepository from '../baseRepositories/base-repository';
import { IClientWallet } from '../../models/interfaces/client-wallet.model.interface';
import { ClientSession } from 'mongoose';

export interface IClientWalletRepository extends BaseRepository<IClientWallet> {
  findByClientId(clientId: string): Promise<IClientWallet | null>;
  createWallet(clientId: string, session?: ClientSession): Promise<IClientWallet>;
  updateBalance(
    clientId: string,
    amount: number,
    session?: ClientSession,
  ): Promise<IClientWallet | null>;
  incrementTotalFunded(
    clientId: string,
    amount: number,
    session?: ClientSession,
  ): Promise<IClientWallet | null>;
  incrementTotalRefunded(
    clientId: string,
    amount: number,
    session?: ClientSession,
  ): Promise<IClientWallet | null>;
}
