import 'reflect-metadata';
import cron from 'node-cron';
import { container } from 'tsyringe';
import '../config/container';
import { IClientContractService } from '../services/clientServices/interfaces/client-contract-service.interface';

const clientContractService = container.resolve<IClientContractService>('IClientContractService');

async function runAutoApprove() {
  try {
    await clientContractService.autoApprovePendingDeliverables();
  } catch (err) {
    console.error('Auto-approval cron failed:', err);
  }
}
cron.schedule('0 * * * *', async () => {
  await runAutoApprove();
});
