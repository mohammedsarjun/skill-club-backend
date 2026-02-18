import mongoose, { Schema } from 'mongoose';
import { IClientWallet } from './interfaces/client-wallet.model.interface';

const ClientWalletSchema = new Schema<IClientWallet>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'User',
      index: true,
    },
    balance: { type: Number, default: 0 },
    totalFunded: { type: Number, default: 0 },
    totalRefunded: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const ClientWallet = mongoose.model<IClientWallet>('ClientWallet', ClientWalletSchema);
