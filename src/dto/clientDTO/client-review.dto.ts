export interface SubmitReviewDTO {
  rating: number;
  comment?: string;
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
  comment?: string;
  createdAt: Date;
}
