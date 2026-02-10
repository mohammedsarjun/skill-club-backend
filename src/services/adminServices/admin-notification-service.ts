import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IAdminNotificationService } from './interfaces/admin-notification-service.interface';
import { NotificationListResponseDto } from '../../dto/NotificationDto/notification-response.dto';
import { INotificationRepository } from '../../repositories/interfaces/notification-repository.interface';
import { mapNotificationToResponseDto } from '../../mapper/commonMapper/notification.mapper';
import { Types } from 'mongoose';
import AppError from '../../utils/app-error';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { HttpStatus } from '../../enums/http-status.enum';

@injectable()
export class AdminNotificationService implements IAdminNotificationService {
  private _notificationRepository: INotificationRepository;

  constructor(
    @inject('INotificationRepository') notificationRepository: INotificationRepository
  ) {
    this._notificationRepository = notificationRepository;
  }

  async getNotifications(): Promise<NotificationListResponseDto> {
    const allNotifications = await this._notificationRepository.findAll();
    const notifications = allNotifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 100);
    const unreadCount = await this._notificationRepository.count({ isRead: false });

    return {
      notifications: notifications.map(mapNotificationToResponseDto),
      unreadCount,
      totalCount: notifications.length,
    };
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const notification = await this._notificationRepository.findById(notificationId);
    
    if (!notification) {
      throw new AppError(ERROR_MESSAGES.NOTIFICATION.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this._notificationRepository.markAsRead(new Types.ObjectId(notificationId));
  }

  async markAllNotificationsAsRead(): Promise<void> {
    const unreadNotifications = await this._notificationRepository.findAll();
    const updatePromises = unreadNotifications
      .filter(n => !n.isRead)
      .map(n => this._notificationRepository.updateById(n._id.toString(), { isRead: true }));
    await Promise.all(updatePromises);
  }
}
