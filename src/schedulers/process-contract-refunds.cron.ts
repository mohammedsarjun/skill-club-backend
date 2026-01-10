import 'reflect-metadata';
import cron from 'node-cron';
import { container } from 'tsyringe';
import '../config/container';
import { IContractTransactionRepository } from '../repositories/interfaces/contract-transaction-repository.interface';
import { IClientWalletRepository } from '../repositories/interfaces/client-wallet-repository.interface';
import { Types } from 'mongoose';
import { Contract } from '../models/contract.model';

const contractTransactionRepository = container.resolve<IContractTransactionRepository>('IContractTransactionRepository');
const clientWalletRepository = container.resolve<IClientWalletRepository>('IClientWalletRepository');

async function processContractRefunds() {
  try {
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

    const contracts = await Contract.find({
      status: 'refunded',
      updatedAt: { $lte: fourDaysAgo }
    }).lean();

    for (const contract of contracts) {
      try {
        const fundingTransactions = await contractTransactionRepository.findByContractId(contract._id.toString());
        const fundingTransaction = fundingTransactions.find(t => t.purpose === 'funding');

        if (!fundingTransaction) {
          console.error(`No funding transaction found for contract ${contract.contractId}`);
          continue;
        }

        const refundAmount = fundingTransaction.amount;

        await contractTransactionRepository.createTransaction({
          contractId: new Types.ObjectId(contract._id.toString()),
          paymentId: fundingTransaction.paymentId,
          clientId: contract.clientId,
          freelancerId: contract.freelancerId,
          amount: refundAmount,
          purpose: 'refund',
          description: `Refund for cancelled fixed contract ${contract.contractId}`,
          metadata: {
            reason: 'contract_cancellation',
            originalAmount: refundAmount,
            disputeWindowExpired: true,
          },
        });

        await clientWalletRepository.updateBalance(contract.clientId.toString(), refundAmount);
        await clientWalletRepository.incrementTotalRefunded(contract.clientId.toString(), refundAmount);

        await Contract.updateOne(
          { _id: contract._id },
          { status: 'cancelled' }
        );

        console.log(`Successfully processed refund for contract ${contract.contractId}`);
      } catch (error) {
        console.error(`Failed to process refund for contract ${contract.contractId}:`, error);
      }
    }
  } catch (error) {
    console.error('Process contract refunds cron failed:', error);
  }
}

cron.schedule('0 2 * * *', async () => {
  await processContractRefunds();
});
