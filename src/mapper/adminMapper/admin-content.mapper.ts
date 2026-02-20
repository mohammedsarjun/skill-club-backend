import { IContent } from '../../models/interfaces/content.model.interface';
import { ContentResponseDTO, UpdateContentDTO } from '../../dto/adminDTO/admin-content.dto';

export const mapContentModelToContentResponseDTO = (content: IContent): ContentResponseDTO => {
  return {
    id: content._id.toString(),
    slug: content.slug,
    title: content.title,
    content: content.content,
    icon: content.icon,
    isPublished: content.isPublished,
    lastUpdatedBy: content.lastUpdatedBy,
    updatedAt: content.updatedAt.toISOString(),
  };
};

export const mapUpdateContentDTOToContentModel = (
  dto: UpdateContentDTO,
): Partial<Pick<IContent, 'title' | 'content' | 'icon' | 'isPublished'>> => {
  const updateData: Partial<Pick<IContent, 'title' | 'content' | 'icon' | 'isPublished'>> = {};

  if (dto.title !== undefined) updateData.title = dto.title;
  if (dto.content !== undefined) updateData.content = dto.content;
  if (dto.icon !== undefined) updateData.icon = dto.icon;
  if (dto.isPublished !== undefined) updateData.isPublished = dto.isPublished;

  return updateData;
};
