import { NotificationListResponseDto } from '../../../dto/NotificationDto/notification-response.dto';

export interface IAdminNotificationService {
  getNotifications(): Promise<NotificationListResponseDto>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  markAllNotificationsAsRead(): Promise<void>;
}
