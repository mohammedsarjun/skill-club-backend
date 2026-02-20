import BaseRepository from '../../baseRepositories/base-repository';
import { IContent } from '../../../models/interfaces/content.model.interface';

export interface IAdminContentRepository extends BaseRepository<IContent> {
  findBySlug(slug: string): Promise<IContent | null>;
  findAllContents(): Promise<IContent[]>;
  updateBySlug(slug: string, data: Partial<IContent>): Promise<IContent | null>;
  findPublishedBySlug(slug: string): Promise<IContent | null>;
  findAllPublished(): Promise<IContent[]>;
}
