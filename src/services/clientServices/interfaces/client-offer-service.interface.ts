import {
  ClientOfferRequestDTO,
  ClientOfferResponseDTO,
  ClientOfferQueryParamsDTO,
  ClientOfferListResultDTO,
  ClientOfferDetailDTO,
} from '../../../dto/clientDTO/client-offer.dto';

export interface IClientOfferService {
  createOffer(clientId: string, offerData: ClientOfferRequestDTO): Promise<ClientOfferResponseDTO>;
  getAllOffers(
    clientId: string,
    query: ClientOfferQueryParamsDTO,
  ): Promise<ClientOfferListResultDTO>;
  getOfferDetail(clientId: string, offerId: string): Promise<ClientOfferDetailDTO | null>;
  withdrawOffer(clientId: string, offerId: string): Promise<{ withdrawn: boolean }>;
}
