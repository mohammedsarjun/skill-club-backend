import cron from 'node-cron';
import { container } from 'tsyringe';
import '../config/container';
import { IMeetingStatusService } from '../services/commonServices/interfaces/meeting-status-service.interface';

cron.schedule('* * * * *', async () => {
  const meetingStatusService = container.resolve<IMeetingStatusService>('IMeetingStatusService');
  console.log('🔄 Running meeting status change cron job at', new Date());
  
  const startedCount = await meetingStatusService.startScheduledMeetings();
  if (startedCount > 0) {
    console.log(`✅ ${startedCount} meeting(s) started at ${new Date()}`);
  }

  const completedCount = await meetingStatusService.completeOngoingMeetings();
  if (completedCount > 0) {
    console.log(`✅ ${completedCount} meeting(s) ended at ${new Date()}`);
  }
});
