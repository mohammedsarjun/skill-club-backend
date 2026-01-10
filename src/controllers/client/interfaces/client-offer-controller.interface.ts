import { Request, Response } from 'express';
export interface IClientOfferController {
  createOffer(req: Request, res: Response): Promise<void>;
  getAllOffers(req: Request, res: Response): Promise<void>;
  getOfferDetail(req: Request, res: Response): Promise<void>;
  withdrawOffer(req: Request, res: Response): Promise<void>;
}
