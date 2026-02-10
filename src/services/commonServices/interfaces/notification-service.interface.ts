import { CreateNotificationInputDto } from "src/dto/NotificationDto/notification.dto";

export interface INotificationService {
   createAndEmitNotification(userId: string, notificationData: Partial<CreateNotificationInputDto>): Promise<void> 
}
