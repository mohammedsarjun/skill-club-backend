import { NotificationListResponseDto } from '../../../dto/NotificationDto/notification-response.dto';

export interface IClientNotificationService {
  getNotifications(clientId: string): Promise<NotificationListResponseDto>;
  markNotificationAsRead(clientId: string, notificationId: string): Promise<void>;
  markAllNotificationsAsRead(clientId: string): Promise<void>;
}
