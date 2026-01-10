import { Types } from 'mongoose';
import { Document } from 'mongoose';
export interface IReview {
    
  contractId: Types.ObjectId;

  reviewerId: Types.ObjectId;

  revieweeId: Types.ObjectId;

  reviewerRole: 'client' | 'freelancer';

  rating: number;

  comment?: string;

  isDeleted: boolean;

  isHideByAdmin: boolean;

  createdAt?: Date;

  updatedAt?: Date;
}


export interface IReviewDocument extends IReview, Document {}
