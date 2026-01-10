export interface SubmitReviewDTO {
  rating: number;
}

export interface ReviewStatusResponseDTO {
  hasReviewed: boolean;
  reviewId?: string;
}

export interface ReviewResponseDTO {
  reviewId: string;
  contractId: string;
  reviewerId: string;
  revieweeId: string;
  reviewerRole: 'client' | 'freelancer';
  rating: number;
  createdAt: Date;
}
