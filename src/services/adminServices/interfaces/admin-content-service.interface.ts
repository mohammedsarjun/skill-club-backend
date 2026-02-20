import { ContentListResponseDTO, ContentResponseDTO, UpdateContentDTO } from '../../../dto/adminDTO/admin-content.dto';

export interface IAdminContentService {
  getAllContents(): Promise<ContentListResponseDTO>;
  getContentBySlug(slug: string): Promise<ContentResponseDTO>;
  updateContent(slug: string, data: UpdateContentDTO): Promise<ContentResponseDTO>;
  getPublishedContentBySlug(slug: string): Promise<ContentResponseDTO>;
  getAllPublishedContents(): Promise<ContentListResponseDTO>;
  seedDefaultContents(): Promise<void>;
}
