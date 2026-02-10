import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IClientNotificationService } from '../../services/clientServices/interfaces/client-notification-service.interface';
import { HttpStatus } from '../../enums/http-status.enum';

@injectable()
export class ClientNotificationController {
  private _notificationService: IClientNotificationService;

  constructor(
    @inject('IClientNotificationService') notificationService: IClientNotificationService
  ) {
    this._notificationService = notificationService;
  }

  async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientId = req.user?.userId;
      if (!clientId) {
        res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const notifications = await this._notificationService.getNotifications(clientId);
      res.status(HttpStatus.OK).json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  async markNotificationAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientId = req.user?.userId;
      const { notificationId } = req.params;

      if (!clientId) {
        res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
        return;
      }

      await this._notificationService.markNotificationAsRead(clientId, notificationId);
      res.status(HttpStatus.OK).json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      next(error);
    }
  }

  async markAllNotificationsAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientId = req.user?.userId;
      if (!clientId) {
        res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
        return;
      }

      await this._notificationService.markAllNotificationsAsRead(clientId);
      res.status(HttpStatus.OK).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }
}
