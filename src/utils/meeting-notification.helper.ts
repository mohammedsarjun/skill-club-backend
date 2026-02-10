import { Types } from 'mongoose';
import { CreateNotificationInputDto } from '../dto/NotificationDto/notification.dto';

export const buildMeetingNotification = (
  userId: Types.ObjectId,
  role: 'client' | 'freelancer',
  title: string,
  message: string,
  meetingId: string,
): Partial<CreateNotificationInputDto> => {
  return {
    userId: new Types.ObjectId(userId),
    role,
    title,
    message,
    type: 'meeting',
    relatedId: meetingId,
    actionUrl: `/${role}/meetings`,
  };
};
