import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IClientNotificationService } from './interfaces/client-notification-service.interface';
import { NotificationListResponseDto } from '../../dto/NotificationDto/notification-response.dto';
import { INotificationRepository } from '../../repositories/interfaces/notification-repository.interface';
import { mapNotificationToResponseDto } from '../../mapper/commonMapper/notification.mapper';
import { Types } from 'mongoose';
import AppError from '../../utils/app-error';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { HttpStatus } from '../../enums/http-status.enum';

@injectable()
export class ClientNotificationService implements IClientNotificationService {
  private _notificationRepository: INotificationRepository;

  constructor(
    @inject('INotificationRepository') notificationRepository: INotificationRepository
  ) {
    this._notificationRepository = notificationRepository;
  }

  async getNotifications(clientId: string): Promise<NotificationListResponseDto> {
    const userId = new Types.ObjectId(clientId);
    const notifications = await this._notificationRepository.getUserNotifications(userId, 'client');
    const unreadCount = await this._notificationRepository.getUnreadCount(userId, 'client');

    return {
      notifications: notifications.map(mapNotificationToResponseDto),
      unreadCount,
      totalCount: notifications.length,
    };
  }

  async markNotificationAsRead(clientId: string, notificationId: string): Promise<void> {
    const notification = await this._notificationRepository.findById(notificationId);
    
    if (!notification) {
      throw new AppError(ERROR_MESSAGES.NOTIFICATION.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (notification.userId.toString() !== clientId) {
      throw new AppError(ERROR_MESSAGES.NOTIFICATION.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    await this._notificationRepository.markAsRead(new Types.ObjectId(notificationId));
  }

  async markAllNotificationsAsRead(clientId: string): Promise<void> {
    const userId = new Types.ObjectId(clientId);
    await this._notificationRepository.markAllAsRead(userId, 'client');
  }
}
