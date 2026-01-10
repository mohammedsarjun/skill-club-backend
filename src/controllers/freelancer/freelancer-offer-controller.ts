import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import { IFreelancerOfferController } from './interfaces/freelancer-offer-controller.interface';
import { IFreelancerOfferService } from '../../services/freelancerServices/interfaces/freelancer-offer-service.interface';
import { FreelancerOfferQueryParamsDTO } from '../../repositories/interfaces/offer-repository.interface';
import { OfferStatus, OfferType } from '../../models/interfaces/offer.model.interface';

@injectable()
export class FreelancerOfferController implements IFreelancerOfferController {
  private _freelancerOfferService: IFreelancerOfferService;
  constructor(@inject('IFreelancerOfferService') freelancerOfferService: IFreelancerOfferService) {
    this._freelancerOfferService = freelancerOfferService;
  }

  async getAllOffers(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { search, page, limit, status, offerType } = req.query as Record<
      string,
      string | undefined
    >;

    const allowedStatuses: OfferStatus[] = [
      'pending',
      'accepted',
      'rejected',
      'withdrawn',
      'expired',
    ];
    const allowedOfferTypes: OfferType[] = ['direct', 'proposal'];

    const parsedStatus: OfferStatus | undefined =
      status && allowedStatuses.includes(status as OfferStatus)
        ? (status as OfferStatus)
        : undefined;
    const parsedOfferType: OfferType | undefined =
      offerType && allowedOfferTypes.includes(offerType as OfferType)
        ? (offerType as OfferType)
        : undefined;

    const query: FreelancerOfferQueryParamsDTO = {
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      filters: {
        status: parsedStatus,
        offerType: parsedOfferType,
      },
    };
    const result = await this._freelancerOfferService.getAllOffers(freelancerId, query);
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Offers fetched successfully',
      data: result,
    });
  }

  async getOfferDetail(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { offerId } = req.params;
    const result = await this._freelancerOfferService.getOfferDetail(freelancerId, offerId);
    if (!result) {
      res.status(HttpStatus.NOT_FOUND).json({ success: false, message: 'Offer not found' });
      return;
    }
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Offer detail fetched successfully',
      data: result,
    });
  }

  async rejectOffer(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { offerId } = req.params;
    const reason = (req.body && (req.body.reason as string)) || undefined;
    try {
      const result = await this._freelancerOfferService.rejectOffer(freelancerId, offerId, reason);
      res.status(HttpStatus.OK).json({ success: true, message: 'Offer rejected', data: result });
    } catch (e) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: (e as Error).message || 'Failed to reject offer' });
    }
  }

  async acceptOffer(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { offerId } = req.params;
    try {
      const result = await this._freelancerOfferService.acceptOffer(freelancerId, offerId);
      res.status(HttpStatus.OK).json({ success: true, message: 'Offer accepted', data: result });
    } catch (e) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: (e as Error).message || 'Failed to accept offer' });
    }
  }
}
