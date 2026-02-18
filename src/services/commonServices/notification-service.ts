import { injectable, inject } from 'tsyringe';
import '../../config/container';

import { INotificationService } from './interfaces/notification-service.interface';
import { INotificationRepository } from '../../repositories/interfaces/notification-repository.interface';
import { emitNotification } from '../../config/socket';
import { CreateNotificationInputDto } from '../../dto/NotificationDto/notification.dto';

@injectable()
export class NotificationService implements INotificationService {
  private _notificationRepository: INotificationRepository;

  constructor(@inject('INotificationRepository') notificationRepository: INotificationRepository) {
    this._notificationRepository = notificationRepository;
  }

  async createAndEmitNotification(
    userId: string,
    notificationData: Partial<CreateNotificationInputDto>,
  ): Promise<void> {
    const notification = await this._notificationRepository.createNotification(notificationData);
    emitNotification(userId, notification);
  }
}
