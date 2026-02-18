import 'reflect-metadata';
import cron from 'node-cron';
import { container } from 'tsyringe';
import '../config/container';
import { IWorklogTransactionService } from '../services/commonServices/interfaces/worklog-transaction-service.interface';

import { IAdminReportedJobService } from '../services/adminServices/interfaces/admin-reported-job-service.interface';
import { IHighReportedJob } from '../models/interfaces/reported-job.model.interface';
import { IAdminJobService } from '../services/adminServices/interfaces/admin-job-service.interface';
const worklogTransactionService = container.resolve<IWorklogTransactionService>(
  'IWorklogTransactionService',
);
const adminReportedJobService = container.resolve<IAdminReportedJobService>(
  'IAdminReportedJobService',
);
const adminJobService = container.resolve<IAdminJobService>('IAdminJobService');
async function releaseExpiredHoldTransactions() {
  try {
    await worklogTransactionService.releaseExpiredHoldTransactions();
  } catch (err) {
    console.error('Release expired hold transactions cron failed:', err);
  }
}

async function suspendReportedJob() {
  try {
    const reportedJobs = await adminReportedJobService.getHighReportedJobs();

    reportedJobs.forEach(async (job: IHighReportedJob) => {
      await adminJobService.suspendJob(
        job?.jobId?.toString(),
        'The job has been suspended due to receiving a high number of reports.',
      );
    });
  } catch (err) {
    console.error('Release expired hold transactions cron failed:', err);
  }
}

cron.schedule('0 * * * *', async () => {
  await releaseExpiredHoldTransactions();
  await suspendReportedJob();
});
