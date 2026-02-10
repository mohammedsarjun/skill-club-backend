import { NotificationListResponseDto } from '../../../dto/NotificationDto/notification-response.dto';

export interface IFreelancerNotificationService {
  getNotifications(freelancerId: string): Promise<NotificationListResponseDto>;
  markNotificationAsRead(freelancerId: string, notificationId: string): Promise<void>;
  markAllNotificationsAsRead(freelancerId: string): Promise<void>;
}
