import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IClientNotificationService } from '../../services/clientServices/interfaces/client-notification-service.interface';
import { HttpStatus } from '../../enums/http-status.enum';
import { MESSAGES } from '../../contants/contants';

@injectable()
export class ClientNotificationController {
  private _notificationService: IClientNotificationService;

  constructor(
    @inject('IClientNotificationService') notificationService: IClientNotificationService,
  ) {
    this._notificationService = notificationService;
  }

  async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientId = req.user?.userId;
      if (!clientId) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ success: false, message: MESSAGES.AUTH.UNAUTHORIZED });
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
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ success: false, message: MESSAGES.AUTH.UNAUTHORIZED });
        return;
      }

      await this._notificationService.markNotificationAsRead(clientId, notificationId);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: MESSAGES.NOTIFICATION.MARKED_AS_READ });
    } catch (error) {
      next(error);
    }
  }

  async markAllNotificationsAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientId = req.user?.userId;
      if (!clientId) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ success: false, message: MESSAGES.AUTH.UNAUTHORIZED });
        return;
      }

      await this._notificationService.markAllNotificationsAsRead(clientId);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: MESSAGES.NOTIFICATION.ALL_MARKED_AS_READ });
    } catch (error) {
      next(error);
    }
  }
}
