export interface ClientOfferRequestDTO {
  freelancerId: string;
  proposalId?: string;
  jobId?: string;
  offerType: 'direct' | 'proposal';
  title: string;
  description: string;
  payment_type: 'fixed' | 'fixed_with_milestones' | 'hourly';
  budget?: number;
  hourly_rate?: number;
  estimated_hours_per_week?: number;
  milestones?: {
    title: string;
    amount: number;
    expected_delivery: string;
    revisions?: number;
  }[];
  expected_end_date?: string;
  categoryId: string;
  reporting: {
    frequency: 'daily' | 'weekly' | 'monthly';
    due_time_utc: string; // HH:mm
    due_day_of_week?:
      | 'monday'
      | 'tuesday'
      | 'wednesday'
      | 'thursday'
      | 'friday'
      | 'saturday'
      | 'sunday';
    due_day_of_month?: number;
    format: 'text_with_attachments' | 'text_only' | 'video';
  };
  reference_files: { file_name: string; file_url: string }[];
  reference_links: { description: string; link: string }[];
  expires_at: string;
  revisions?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
}

export interface ClientOfferResponseDTO {
  offerId: string;
  freelancerId: string;
  proposalId?: string;
  jobId?: string;
  status: string;
  title: string;
  description: string;
  paymentType: string;
  budget?: number;
  hourlyRate?: number;
  milestones?: {
    title: string;
    amount: number;
    expectedDelivery: Date;
  }[];
  expectedEndDate?: Date;
  expiresAt: Date;
  createdAt: Date;
}

import { OfferStatus, OfferType } from '../../models/interfaces/offer.model.interface';

export interface ClientOfferQueryParamsDTO {
  search?: string;
  page?: number;
  limit?: number;
  filters: {
    status?: OfferStatus;
    offerType?: OfferType;
  };
}

export interface ClientOfferListItemDTO {
  offerId: string;
  title: string;
  description?: string;
  paymentType: 'fixed' | 'fixed_with_milestones' | 'hourly';
  budget?: number;
  hourlyRate?: number;
  status: string;
  createdAt: Date;
  expiresAt?: Date;
  freelancer?: {
    freelancerId: string;
    firstName?: string;
    lastName?: string;
    logo?: string;
  };
}

export interface ClientOfferListResultDTO {
  items: ClientOfferListItemDTO[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ClientOfferDetailDTO extends ClientOfferListItemDTO {
  jobId?: string;
  proposalId?: string;
  jobTitle?: string;
  freelancer?: {
    freelancerId: string;
    firstName?: string;
    lastName?: string;
    logo?: string;
    country?: string;
    rating?: number;
  };
  milestones?: {
    title: string;
    amount: number;
    expectedDelivery: Date;
  }[];
  expectedStartDate?: Date;
  expectedEndDate?: Date;
  category?: {
    categoryId: string;
    categoryName: string;
  };
  reporting?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dueTimeUtc?: string;
    dueDayOfWeek?: string;
    dueDayOfMonth?: number;
    format?: 'text_with_attachments' | 'text_only' | 'video';
  };
  referenceFiles?: { fileName: string; fileUrl: string }[];
  referenceLinks?: { description: string; link: string }[];
  timeline?: { status: string; at: Date; note?: string }[];
  rejectedReason?: string;
}
