import { IAdminContentService } from './interfaces/admin-content-service.interface';
import { ContentListResponseDTO, ContentResponseDTO, UpdateContentDTO } from '../../dto/adminDTO/admin-content.dto';
import type { IAdminContentRepository } from '../../repositories/adminRepositories/interfaces/admin-content-repository.interface';
import { injectable, inject } from 'tsyringe';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import {
  mapContentModelToContentResponseDTO,
  mapUpdateContentDTOToContentModel,
} from '../../mapper/adminMapper/admin-content.mapper';
import { ERROR_MESSAGES } from '../../contants/error-constants';

const DEFAULT_CONTENTS = [
  {
    slug: 'terms',
    title: 'Terms & Conditions',
    content: 'Welcome to our platform. By accessing or using our services, you agree to be bound by these Terms and Conditions.\n\n1. Acceptance of Terms\nBy using this service, you confirm that you are at least 18 years of age and have the legal capacity to enter into this agreement.\n\n2. Use of Service\nYou agree to use our services only for lawful purposes and in a manner that does not infringe the rights of others.\n\n3. Changes to Terms\nWe reserve the right to modify these terms at any time. We will notify users of significant changes via email.',
    icon: '📄',
    isPublished: true,
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    content: 'Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.\n\n1. Information We Collect\nWe collect information you provide directly to us, such as when you create an account or contact support.\n\n2. How We Use Your Information\nWe use the information to provide and improve our services, process transactions, and comply with legal obligations.\n\n3. Data Security\nWe implement appropriate security measures to protect your personal information against unauthorized access.',
    icon: '🔒',
    isPublished: true,
  },
  {
    slug: 'faq',
    title: 'FAQ',
    content: 'Frequently Asked Questions\n\nHow do I create an account?\nClick the "Sign Up" button on our homepage and follow the registration steps.\n\nWhat payment methods do you accept?\nWe accept all major credit cards, PayPal, and bank transfers for enterprise accounts.\n\nCan I cancel my subscription at any time?\nYes, you can cancel your subscription at any time from your account settings.\n\nHow do I contact support?\nYou can reach our support team via live chat or by emailing support@example.com.',
    icon: '❓',
    isPublished: true,
  },
  {
    slug: 'about',
    title: 'About Us',
    content: 'We are a passionate team of innovators dedicated to building tools that empower businesses and individuals to achieve more.\n\nOur Story\nFounded in 2020, we started with a simple mission: make powerful technology accessible to everyone.\n\nOur Mission\nTo democratize access to cutting-edge technology and provide tools that help our users succeed.\n\nOur Values\nTransparency, Innovation, and putting Users first in every decision we make.',
    icon: '👥',
    isPublished: true,
  },
];

@injectable()
export class AdminContentService implements IAdminContentService {
  private _adminContentRepository: IAdminContentRepository;

  constructor(
    @inject('IAdminContentRepository')
    adminContentRepository: IAdminContentRepository,
  ) {
    this._adminContentRepository = adminContentRepository;
  }

  async getAllContents(): Promise<ContentListResponseDTO> {
    const contents = await this._adminContentRepository.findAllContents();
    return {
      data: contents.map(mapContentModelToContentResponseDTO),
    };
  }

  async getContentBySlug(slug: string): Promise<ContentResponseDTO> {
    const content = await this._adminContentRepository.findBySlug(slug);
    if (!content) {
      throw new AppError(ERROR_MESSAGES.CONTENT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return mapContentModelToContentResponseDTO(content);
  }

  async updateContent(slug: string, data: UpdateContentDTO): Promise<ContentResponseDTO> {
    const existing = await this._adminContentRepository.findBySlug(slug);
    if (!existing) {
      throw new AppError(ERROR_MESSAGES.CONTENT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const updateData = mapUpdateContentDTOToContentModel(data);
    const updated = await this._adminContentRepository.updateBySlug(slug, updateData);
    if (!updated) {
      throw new AppError(ERROR_MESSAGES.CONTENT.UPDATE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return mapContentModelToContentResponseDTO(updated);
  }

  async getPublishedContentBySlug(slug: string): Promise<ContentResponseDTO> {
    const content = await this._adminContentRepository.findPublishedBySlug(slug);
    if (!content) {
      throw new AppError(ERROR_MESSAGES.CONTENT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return mapContentModelToContentResponseDTO(content);
  }

  async getAllPublishedContents(): Promise<ContentListResponseDTO> {
    const contents = await this._adminContentRepository.findAllPublished();
    return {
      data: contents.map(mapContentModelToContentResponseDTO),
    };
  }

  async seedDefaultContents(): Promise<void> {
    for (const defaultContent of DEFAULT_CONTENTS) {
      const existing = await this._adminContentRepository.findBySlug(defaultContent.slug);
      if (!existing) {
        await this._adminContentRepository.create(defaultContent as Partial<never>);
      }
    }
  }
}
