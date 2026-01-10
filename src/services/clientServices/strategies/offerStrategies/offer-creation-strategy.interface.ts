import { ClientOfferRequestDTO } from '../../../../dto/clientDTO/client-offer.dto';
import { IOffer } from '../../../../models/interfaces/offer.model.interface';

export interface IOfferCreationStrategy {
  create(clientId: string, dto: ClientOfferRequestDTO): Promise<Partial<IOffer>>;
}
