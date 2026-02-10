import cron from 'node-cron';
import { container } from 'tsyringe';
import '../config/container';
import { IMeetingStatusService } from '../services/commonServices/interfaces/meeting-status-service.interface';
import { INotificationService } from '../services/commonServices/interfaces/notification-service.interface';
import { buildMeetingNotification } from '../utils/meeting-notification.helper';

cron.schedule('* * * * *', async () => {
  const meetingStatusService = container.resolve<IMeetingStatusService>('IMeetingStatusService');
  const notificationService = container.resolve<INotificationService>('INotificationService');

  const meetingsStartingSoon = await meetingStatusService.findMeetingsStartingSoon();
  for (const meeting of meetingsStartingSoon) {
    if (meeting.clientId) {
      const clientNotification = buildMeetingNotification(
        meeting.clientId,
        'client',
        'Meeting Starting Soon',
        `Your meeting "${meeting.agenda}" starts in 15 minutes`,
        meeting._id?.toString() || '',
      );
      await notificationService.createAndEmitNotification(meeting.clientId.toString(), clientNotification);
    }
    if (meeting.freelancerId) {
      const freelancerNotification = buildMeetingNotification(
        meeting.freelancerId,
        'freelancer',
        'Meeting Starting Soon',
        `Your meeting "${meeting.agenda}" starts in 15 minutes`,
        meeting._id?.toString() || '',
      );
      await notificationService.createAndEmitNotification(meeting.freelancerId.toString(), freelancerNotification);
    }
  }

  const meetingsGoingLive = await meetingStatusService.findMeetingsGoingLive();
  for (const meeting of meetingsGoingLive) {
    if (meeting.clientId) {
      const clientNotification = buildMeetingNotification(
        meeting.clientId,
        'client',
        'Meeting Is Live',
        `Your meeting "${meeting.agenda}" is now live. Join now!`,
        meeting._id?.toString() || '',
      );
      await notificationService.createAndEmitNotification(meeting.clientId.toString(), clientNotification);
    }
    if (meeting.freelancerId) {
      const freelancerNotification = buildMeetingNotification(
        meeting.freelancerId,
        'freelancer',
        'Meeting Is Live',
        `Your meeting "${meeting.agenda}" is now live. Join now!`,
        meeting._id?.toString() || '',
      );
      await notificationService.createAndEmitNotification(meeting.freelancerId.toString(), freelancerNotification);
    }
  }

  const startedCount = await meetingStatusService.startScheduledMeetings();
  if (startedCount > 0) {
    console.log(`${startedCount} meeting(s) started at ${new Date()}`);
  }

  const completedCount = await meetingStatusService.completeOngoingMeetings();
  if (completedCount > 0) {
    console.log(`${completedCount} meeting(s) ended at ${new Date()}`);
  }
});
