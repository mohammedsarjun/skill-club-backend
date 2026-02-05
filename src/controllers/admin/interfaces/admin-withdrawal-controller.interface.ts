import { Request, Response } from 'express';

export interface IAdminWithdrawalController {
  getWithdrawStats(req:Request,res:Response):Promise<void>
  getWithdrawals(req:Request,res:Response):Promise<void>
}
