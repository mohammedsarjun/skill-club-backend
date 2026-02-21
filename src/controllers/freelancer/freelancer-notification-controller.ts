import { Request, Response, NextFunction } from 'express';
import { MESSAGES } from '../../contants/contants';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IFreelancerNotificationService } from '../../services/freelancerServices/interfaces/freelancer-notification-service.interface';
import { HttpStatus } from '../../enums/http-status.enum';

@injectable()
export class FreelancerNotificationController {
  private _notificationService: IFreelancerNotificationService;

  constructor(
    @inject('IFreelancerNotificationService') notificationService: IFreelancerNotificationService,
  ) {
    this._notificationService = notificationService;
  }

  async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const freelancerId = req.user?.userId;
      if (!freelancerId) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ success: false, message: MESSAGES.AUTH.UNAUTHORIZED });
        return;
      }

      const notifications = await this._notificationService.getNotifications(freelancerId);
      res.status(HttpStatus.OK).json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  async markNotificationAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const freelancerId = req.user?.userId;
      const { notificationId } = req.params;

      if (!freelancerId) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ success: false, message: MESSAGES.AUTH.UNAUTHORIZED });
        return;
      }

      await this._notificationService.markNotificationAsRead(freelancerId, notificationId);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: MESSAGES.NOTIFICATION.MARKED_AS_READ });
    } catch (error) {
      next(error);
    }
  }

  async markAllNotificationsAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const freelancerId = req.user?.userId;
      if (!freelancerId) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ success: false, message: MESSAGES.AUTH.UNAUTHORIZED });
        return;
      }

      await this._notificationService.markAllNotificationsAsRead(freelancerId);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: MESSAGES.NOTIFICATION.ALL_MARKED_AS_READ });
    } catch (error) {
      next(error);
    }
  }
}
