import 'reflect-metadata';
import cron from 'node-cron';
import { container } from 'tsyringe';
import '../config/container';
import { IWorklogTransactionService } from '../services/commonServices/interfaces/worklog-transaction-service.interface';

const worklogTransactionService = container.resolve<IWorklogTransactionService>(
  'IWorklogTransactionService',
);

async function releaseExpiredHoldTransactions() {
  try {
    await worklogTransactionService.releaseExpiredHoldTransactions();
  } catch (err) {
    console.error('Release expired hold transactions cron failed:', err);
  }
}
releaseExpiredHoldTransactions();
cron.schedule('0 * * * *', async () => {
  await releaseExpiredHoldTransactions();
});
