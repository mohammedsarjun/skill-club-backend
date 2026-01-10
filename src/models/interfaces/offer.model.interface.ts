import { Document, Types } from 'mongoose';

export interface OfferMilestone {
  title: string;
  amount: number;
  amountBaseUSD?: number;
  expectedDelivery: Date;
  revisions?: number;
}

export interface OfferReferenceFile {
  fileName: string;
  fileUrl: string;
}

export interface OfferReferenceLink {
  description: string;
  link: string;
}

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
export type OfferType = 'direct' | 'proposal';

export interface OfferTimelineEvent {
  status: OfferStatus;
  at: Date;
  note?: string;
}

export interface OfferDetail {
  clientId: Types.ObjectId;
  freelancerId: Types.ObjectId;
  jobId?: Types.ObjectId;
  proposalId?: Types.ObjectId;
  offerType: OfferType;
  title: string;
  description: string;
  paymentType: 'fixed' | 'fixed_with_milestones' | 'hourly';
  budget?: number;
  budgetBaseUSD?: number;
  hourlyRate?: number;
  hourlyRateBaseUSD?: number;
  currency?: string;
  conversionRate?: number;
  estimatedHoursPerWeek?: number;
  milestones?: OfferMilestone[];
  revisions?: number;
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
    meetingDayOfMonth?: number; // 1..31 when monthly
    meetingTimeUtc?: string; // HH:mm
  };
  reporting: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dueTimeUtc: string; // HH:mm
    dueDayOfWeek?:
      | 'monday'
      | 'tuesday'
      | 'wednesday'
      | 'thursday'
      | 'friday'
      | 'saturday'
      | 'sunday';
    dueDayOfMonth?: number; // 1..31 when monthly
    format: 'text_with_attachments' | 'text_only' | 'video';
  };
  referenceFiles: OfferReferenceFile[];
  referenceLinks: OfferReferenceLink[];
  expiresAt: Date;
  status: OfferStatus;
  timeline: OfferTimelineEvent[];
  createdAt?: Date;
  updatedAt?: Date;
  rejectedReason?: string;
}

export interface IOffer extends OfferDetail, Document {}
