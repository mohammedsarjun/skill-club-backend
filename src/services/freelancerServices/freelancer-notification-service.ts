import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IFreelancerNotificationService } from './interfaces/freelancer-notification-service.interface';
import { NotificationListResponseDto } from '../../dto/NotificationDto/notification-response.dto';
import { INotificationRepository } from '../../repositories/interfaces/notification-repository.interface';
import { mapNotificationToResponseDto } from '../../mapper/commonMapper/notification.mapper';
import { Types } from 'mongoose';
import AppError from '../../utils/app-error';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { HttpStatus } from '../../enums/http-status.enum';

@injectable()
export class FreelancerNotificationService implements IFreelancerNotificationService {
  private _notificationRepository: INotificationRepository;

  constructor(@inject('INotificationRepository') notificationRepository: INotificationRepository) {
    this._notificationRepository = notificationRepository;
  }

  async getNotifications(freelancerId: string): Promise<NotificationListResponseDto> {
    const userId = new Types.ObjectId(freelancerId);
    const notifications = await this._notificationRepository.getUserNotifications(
      userId,
      'freelancer',
    );
    const unreadCount = await this._notificationRepository.getUnreadCount(userId, 'freelancer');

    return {
      notifications: notifications.map(mapNotificationToResponseDto),
      unreadCount,
      totalCount: notifications.length,
    };
  }

  async markNotificationAsRead(freelancerId: string, notificationId: string): Promise<void> {
    const notification = await this._notificationRepository.findById(notificationId);

    if (!notification) {
      throw new AppError(ERROR_MESSAGES.NOTIFICATION.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (notification.userId.toString() !== freelancerId) {
      throw new AppError(ERROR_MESSAGES.NOTIFICATION.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    await this._notificationRepository.markAsRead(new Types.ObjectId(notificationId));
  }

  async markAllNotificationsAsRead(freelancerId: string): Promise<void> {
    const userId = new Types.ObjectId(freelancerId);
    await this._notificationRepository.markAllAsRead(userId, 'freelancer');
  }
}
