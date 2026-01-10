import { Request, Response } from 'express';

export interface IClientDashboardController {
  getDashboardData(req: Request, res: Response): Promise<void>;
}
