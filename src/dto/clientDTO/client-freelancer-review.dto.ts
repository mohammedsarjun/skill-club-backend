export interface FreelancerReviewQueryDTO {
  page: number;
  limit: number;
}

export interface FreelancerReviewItemDTO {
  reviewId: string;
  reviewerName: string;
  reviewerCompanyName?: string;
  reviewerLogo?: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface ReviewStatsDTO {
  averageRating: number;
  totalReviews: number;
}

export interface FreelancerReviewsResponseDTO {
  reviews: FreelancerReviewItemDTO[];
  stats: ReviewStatsDTO;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
