export interface FreelancerReviewListQueryDTO {
  page: number;
  limit: number;
}

export interface FreelancerReviewItemDTO {
  reviewId: string;
  clientName: string;
  clientCompanyName?: string;
  clientLogo?: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface FreelancerReviewStatsDTO {
  averageRating: number;
  totalReviews: number;
}

export interface FreelancerReviewListPaginationDTO {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface FreelancerReviewListResponseDTO {
  reviews: FreelancerReviewItemDTO[];
  stats: FreelancerReviewStatsDTO;
  pagination: FreelancerReviewListPaginationDTO;
}
