import {
  SubmitReviewDTO,
  ReviewStatusResponseDTO,
  ReviewResponseDTO,
} from '../../../dto/clientDTO/client-review.dto';

export interface IClientReviewService {
  submitReview(
    clientId: string,
    contractId: string,
    data: SubmitReviewDTO,
  ): Promise<ReviewResponseDTO>;
  getReviewStatus(clientId: string, contractId: string): Promise<ReviewStatusResponseDTO>;
}
