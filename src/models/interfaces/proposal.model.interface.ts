import { Document, Types } from 'mongoose';

export interface ProposalDetail {
  freelancerId: Types.ObjectId;
  jobId: Types.ObjectId;
  hourlyRate?: number;
  availableHoursPerWeek?: number;
  proposedBudget?: number;
  deadline?: Date;
  status: 'pending_verification' | 'rejected' | 'offer_sent';
  coverLetter: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProposal extends ProposalDetail, Document {}

export interface ProposalDetailWithFreelancerDetail extends IProposal {
  freelancer: {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    freelancerProfile: {
      logo: string;
    };
    address: {
      country: string;
    };
  };
}

export interface ProposalDetailWithJobDetail extends IProposal {
  jobDetail: {
    _id: Types.ObjectId;
    title: string;
    description: string;
    clientId: Types.ObjectId;
  };
}
