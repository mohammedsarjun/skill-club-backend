import { IOfferCreationStrategy } from './offer-creation-strategy.interface';
import { ClientOfferRequestDTO } from '../../../../dto/clientDTO/client-offer.dto';
import { IOffer } from '../../../../models/interfaces/offer.model.interface';
import { Types } from 'mongoose';
import AppError from '../../../../utils/app-error';
import { HttpStatus } from '../../../../enums/http-status.enum';

export class DirectOfferStrategy implements IOfferCreationStrategy {
  async create(clientId: string, dto: ClientOfferRequestDTO): Promise<Partial<IOffer>> {
    // Validate IDs before constructing ObjectId instances
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId provided', HttpStatus.BAD_REQUEST);
    }
    if (!Types.ObjectId.isValid(dto.freelancerId)) {
      throw new AppError('Invalid freelancerId provided', HttpStatus.BAD_REQUEST);
    }

    return {
      clientId: new Types.ObjectId(clientId),
      freelancerId: new Types.ObjectId(dto.freelancerId),
      offerType: 'direct',
      title: dto.title,
      description: dto.description,
      paymentType: dto.payment_type,
      budget: dto.budget,
      hourlyRate: dto.hourly_rate,
      estimatedHoursPerWeek: dto.estimated_hours_per_week,
      milestones: dto.milestones?.map((m) => ({
        title: m.title,
        amount: m.amount,
        expectedDelivery: new Date(m.expected_delivery),
        revisions: typeof m.revisions === 'number' ? m.revisions : undefined,
      })),
      expectedEndDate: dto.expected_end_date ? new Date(dto.expected_end_date) : undefined,
      communication: {
        preferredMethod: dto.communication.preferred_method,
        meetingFrequency: dto.communication.meeting_frequency,
        meetingDayOfWeek: dto.communication.meeting_day_of_week,
        meetingDayOfMonth: dto.communication.meeting_day_of_month,
        meetingTimeUtc: dto.communication.meeting_time_utc,
      },
      reporting: {
        frequency: dto.reporting.frequency,
        dueTimeUtc: dto.reporting.due_time_utc,
        dueDayOfWeek: dto.reporting.due_day_of_week,
        dueDayOfMonth: dto.reporting.due_day_of_month,
        format: dto.reporting.format,
      },
      referenceFiles: dto.reference_files.map((f) => ({
        fileName: f.file_name,
        fileUrl: f.file_url,
      })),
      referenceLinks: dto.reference_links.map((l) => ({
        description: l.description,
        link: l.link,
      })),
      expiresAt: new Date(dto.expires_at),
      status: 'pending',
      timeline: [{ status: 'pending', at: new Date(), note: 'Offer created' }],
      revisions: typeof dto.revisions === 'number' ? dto.revisions : undefined,
    };
  }
}
