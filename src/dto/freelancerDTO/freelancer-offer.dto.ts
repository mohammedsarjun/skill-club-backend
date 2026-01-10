import { OfferStatus, OfferType } from '../../models/interfaces/offer.model.interface';

export interface FreelancerOfferQueryParamsDTO {
  search?: string;
  page?: number;
  limit?: number;
  filters: {
    status?: OfferStatus;
    offerType?: OfferType;
  };
}

export interface FreelancerOfferListItemDTO {
  offerId: string;
  title: string;
  description: string;
  offerType: OfferType;
  paymentType: 'fixed' | 'fixed_with_milestones' | 'hourly';
  budget?: number;
  hourlyRate?: number;
  status: OfferStatus;
  createdAt: Date;
  expiresAt: Date;
  client?: {
    clientId: string;
    firstName?: string;
    lastName?: string;
    logo?: string;
  };
}

export interface FreelancerOfferListResultDTO {
  items: FreelancerOfferListItemDTO[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface FreelancerOfferDetailDTO extends FreelancerOfferListItemDTO {
  jobId?: string;
  proposalId?: string;
  jobTitle?: string;
  clientCountry?: string;
  clientCompanyName?: string;
  clientTotalJobsPosted?: number;
  milestones?: {
    title: string;
    amount: number;
    expectedDelivery: Date;
  }[];
  expectedStartDate?: Date;
  expectedEndDate?: Date;
  communication: {
    preferredMethod: 'chat' | 'video_call' | 'email' | 'mixed';
    meetingFrequency?: 'daily' | 'weekly' | 'monthly';
    meetingDayOfWeek?:
      | 'monday'
      | 'tuesday'
      | 'wednesday'
      | 'thursday'
      | 'friday'
      | 'saturday'
      | 'sunday';
    meetingDayOfMonth?: number;
    meetingTimeUtc?: string;
  };
  reporting: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dueTimeUtc: string;
    dueDayOfWeek?:
      | 'monday'
      | 'tuesday'
      | 'wednesday'
      | 'thursday'
      | 'friday'
      | 'saturday'
      | 'sunday';
    dueDayOfMonth?: number;
    format: 'text_with_attachments' | 'text_only' | 'video';
  };
  referenceFiles: { fileName: string; fileUrl: string }[];
  referenceLinks: { description: string; link: string }[];
  timeline: { status: OfferStatus; at: Date; note?: string }[];
  rejectedReason?: string;
}
