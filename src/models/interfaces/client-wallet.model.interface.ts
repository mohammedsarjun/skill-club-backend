import { Document, Types } from 'mongoose';

export interface IClientWallet extends Document {
  clientId: Types.ObjectId;
  balance: number;
  totalFunded: number;
  totalRefunded: number;

  createdAt?: Date;
  updatedAt?: Date;
}
