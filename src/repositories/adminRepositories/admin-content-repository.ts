import { IContent } from '../../models/interfaces/content.model.interface';
import { contentModel } from '../../models/content.model';
import BaseRepository from '../baseRepositories/base-repository';
import { IAdminContentRepository } from './interfaces/admin-content-repository.interface';

export class AdminContentRepository
  extends BaseRepository<IContent>
  implements IAdminContentRepository
{
  constructor() {
    super(contentModel);
  }

  async findBySlug(slug: string): Promise<IContent | null> {
    return super.findOne({ slug });
  }

  async findAllContents(): Promise<IContent[]> {
    return super.findAll({});
  }

  async updateBySlug(slug: string, data: Partial<IContent>): Promise<IContent | null> {
    return super.update({ slug }, data);
  }

  async findPublishedBySlug(slug: string): Promise<IContent | null> {
    return super.findOne({ slug, isPublished: true });
  }

  async findAllPublished(): Promise<IContent[]> {
    return super.findAll({ isPublished: true });
  }
}
