import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IClientOfferController } from './interfaces/client-offer-controller.interface';
import { IClientOfferService } from '../../services/clientServices/interfaces/client-offer-service.interface';
import { ClientOfferQueryParamsDTO } from '../../dto/clientDTO/client-offer.dto';
import { OfferStatus, OfferType } from '../../models/interfaces/offer.model.interface';
import { HttpStatus } from '../../enums/http-status.enum';
import { MESSAGES } from '../../contants/contants';
import { ERROR_MESSAGES } from '../../contants/error-constants';

@injectable()
export class ClientOfferController implements IClientOfferController {
  private _clientOfferService: IClientOfferService;
  constructor(@inject('IClientOfferService') clientOfferService: IClientOfferService) {
    this._clientOfferService = clientOfferService;
  }

  async createOffer(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const offerData = req.body.offerData;
    const result = await this._clientOfferService.createOffer(clientId, offerData);
    res.status(201).json({ success: true, message: MESSAGES.OFFER.CREATED, data: result });
  }

  async getAllOffers(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { search, page, limit, status, offerType } = req.query as Record<string, string>;
    const query: ClientOfferQueryParamsDTO = {
      search: search || undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      filters: {
        status: (status as unknown as OfferStatus) || undefined,
        offerType: (offerType as unknown as OfferType) || undefined,
      },
    };

    const result = await this._clientOfferService.getAllOffers(clientId, query);
    res
      .status(HttpStatus.OK)
      .json({ success: true, message: MESSAGES.OFFER.FETCH_SUCCESS, data: result });
  }

  async getOfferDetail(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { offerId } = req.params;
    const result = await this._clientOfferService.getOfferDetail(clientId, offerId);
    if (!result) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: ERROR_MESSAGES.OFFER.NOT_FOUND });
      return;
    }
    res
      .status(HttpStatus.OK)
      .json({ success: true, message: MESSAGES.OFFER.FETCH_DETAIL_SUCCESS, data: result });
  }

  async withdrawOffer(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { offerId } = req.params;
    try {
      const result = await this._clientOfferService.withdrawOffer(clientId, offerId);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: MESSAGES.OFFER.WITHDRAWN, data: result });
    } catch (e) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: (e as Error).message || 'Failed to withdraw' });
    }
  }
}
