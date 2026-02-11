import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IAdminNotificationService } from '../../services/adminServices/interfaces/admin-notification-service.interface';
import { HttpStatus } from '../../enums/http-status.enum';

@injectable()
export class AdminNotificationController {
  private _notificationService: IAdminNotificationService;

  constructor(
    @inject('IAdminNotificationService') notificationService: IAdminNotificationService
  ) {
    this._notificationService = notificationService;
  }

  async getNotifications(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = await this._notificationService.getNotifications();
      res.status(HttpStatus.OK).json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  async markNotificationAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { notificationId } = req.params;
      await this._notificationService.markNotificationAsRead(notificationId);
      res.status(HttpStatus.OK).json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      next(error);
    }
  }

  async markAllNotificationsAsRead(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this._notificationService.markAllNotificationsAsRead();
      res.status(HttpStatus.OK).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }
}
