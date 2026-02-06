import { Document, Types } from 'mongoose';

export interface JobData {
  title: string;
  description: string;
  category: string;
  specialities: Types.ObjectId[]; // 1–3 items
  skills: Types.ObjectId[]; // 1–10 items
  rateType: 'hourly' | 'fixed';

  // Rates
  hourlyRate?: {
    min: number;
    max: number;
    hoursPerWeek: number;
    estimatedDuration: '1 To 3 Months' | '3 To 6 Months';
  };
  fixedRate?: {
    min: number;
    max: number;
  };

  clientId: Types.ObjectId;

  status: 'pending_verification' | 'rejected' | 'open' | 'closed' | 'archived' | 'suspended';

  verifiedBy?: Types.ObjectId;
  rejectedReason?: string;
  suspendedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IJob extends JobData, Document {}

export interface IJobWithCategoryDetail extends Omit<IJob, 'category' | 'clientId'> {
  category: { _id: string; name: string };
  clientId: {
    companyName: string;
    _id: string;
  };
}

export interface IJobDetail
  extends Omit<IJob, 'category' | 'clientId' | 'specialities' | 'skills'> {
  category: { _id: string; name: string };
  specialities: { _id: string; name: string }[];
  skills: { _id: string; name: string }[];
  clientId: {
    _id: string;
    clientProfile: {
      companyName: string;
      logo: string;
      country?: string;
    };
  };
}

export interface IJobResponse
  extends Omit<IJob, 'category' | 'clientId' | 'specialities' | 'skills'> {
  category: { _id: string; name: string };
  specialities: { _id: string; name: string }[];
  skills: { _id: string; name: string }[];
  client: {
    companyName: string;
    logo: string;
    country?: string;
    rating?: number;
    totalMoneySpent?: number;
  };
  proposalCount?: number;
}
