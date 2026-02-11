import { ClientSession, Types } from 'mongoose';
import BaseRepository from '../baseRepositories/base-repository';

import { INotification } from 'src/models/interfaces/notification.model.interface';

export interface INotificationRepository extends BaseRepository<INotification> {
    createNotification(notificationData: Partial<INotification>, session?: ClientSession): Promise<INotification>;
    getUserNotifications(userId: Types.ObjectId, role: string): Promise<INotification[]>;
    markAsRead(notificationId: Types.ObjectId): Promise<INotification | null>;
    markAllAsRead(userId: Types.ObjectId, role: string): Promise<number>;
    getUnreadCount(userId: Types.ObjectId, role: string): Promise<number>;
}