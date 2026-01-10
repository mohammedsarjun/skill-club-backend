export interface AdminReviewQueryDTO {
  page: number;
  limit: number;
  reviewerRole?: 'client' | 'freelancer';
  isHideByAdmin?: boolean;
}

export interface AdminReviewItemDTO {
  reviewId: string;
  reviewerName: string;
  revieweeName: string;
  reviewerRole: 'client' | 'freelancer';
  rating: number;
  comment?: string;
  isHideByAdmin: boolean;
  createdAt: Date;
}

export interface AdminReviewPaginationDTO {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface AdminReviewsResponseDTO {
  reviews: AdminReviewItemDTO[];
  pagination: AdminReviewPaginationDTO;
}

export interface ToggleHideReviewResponseDTO {
  reviewId: string;
  isHideByAdmin: boolean;
}
