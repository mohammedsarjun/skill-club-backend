import { INotification } from '../../models/interfaces/notification.model.interface';
import { NotificationResponseDto } from '../../dto/NotificationDto/notification-response.dto';

export const mapNotificationToResponseDto = (
  notification: INotification
): NotificationResponseDto => {
  return {
    _id: notification._id.toString(),
    userId: notification.userId.toString(),
    role: notification.role,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    isRead: notification.isRead,
    relatedId: notification.relatedId?.toString(),
    actionUrl: notification.actionUrl || undefined,
    createdAt: notification.createdAt,
  };
};
