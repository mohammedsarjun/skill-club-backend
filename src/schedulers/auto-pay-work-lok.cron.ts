import 'reflect-metadata';
import cron from 'node-cron';
import { container } from 'tsyringe';
import '../config/container';
import { IClientWorklogService } from '../services/clientServices/interfaces/client-worklog-service.interface';

const clientWorklogService = container.resolve<IClientWorklogService>('IClientWorklogService');

async function runAutoPayWorklog() {
  try {
    await clientWorklogService.autoPayWorkLog();
  } catch (err) {
    console.error('Auto-pay worklog cron failed:', err);
  }
}
runAutoPayWorklog();
cron.schedule('0 0 * * 0', async () => {
  await runAutoPayWorklog();
});
