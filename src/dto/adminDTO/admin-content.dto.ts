export interface UpdateContentDTO {
  slug: string;
  title: string;
  content: string;
  icon: string;
  isPublished: boolean;
}

export interface ContentResponseDTO {
  id: string;
  slug: string;
  title: string;
  content: string;
  icon: string;
  isPublished: boolean;
  lastUpdatedBy: string;
  updatedAt: string;
}

export interface ContentListResponseDTO {
  data: ContentResponseDTO[];
}
