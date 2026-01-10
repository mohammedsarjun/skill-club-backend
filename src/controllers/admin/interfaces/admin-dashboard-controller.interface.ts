import { Request, Response } from 'express';

export interface IAdminDashboardController {
  getDashboardStats(req: Request, res: Response): Promise<void>;
  getRevenueData(req: Request, res: Response): Promise<void>;
  getUserGrowthData(req: Request, res: Response): Promise<void>;
}
