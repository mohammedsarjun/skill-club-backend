import notificationModel from '../models/notification.model';
import BaseRepository from './baseRepositories/base-repository';
import { INotificationRepository } from './interfaces/notification-repository.interface';
import { INotification } from '../models/interfaces/notification.model.interface';
import { ClientSession, Types } from 'mongoose';


export class NotificationRepository extends BaseRepository<INotification> implements INotificationRepository {
  constructor() {
    super(notificationModel);
  }

  async createNotification(notificationData: Partial<INotification>, session?: ClientSession): Promise<INotification> {
    return await super.create(notificationData, session);
  }

  async getUserNotifications(userId: Types.ObjectId, role: string): Promise<INotification[]> {
    return await this.model.find({ userId, role }).sort({ createdAt: -1 }).limit(50).exec();
  }

  async markAsRead(notificationId: Types.ObjectId): Promise<INotification | null> {
    return await super.updateById(notificationId.toString(), { isRead: true });
  }

  async markAllAsRead(userId: Types.ObjectId, role: string): Promise<number> {
    const result = await this.model.updateMany(
      { userId, role, isRead: false },
      { $set: { isRead: true } }
    );
    return result.modifiedCount;
  }

  async getUnreadCount(userId: Types.ObjectId, role: string): Promise<number> {
    return await this.count({ userId, role, isRead: false });
  }

}

