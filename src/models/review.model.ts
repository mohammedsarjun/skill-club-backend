import { Schema, model } from 'mongoose';
import {  IReviewDocument } from './interfaces/review.model.interface';

const reviewSchema = new Schema<IReviewDocument>(
  {
  
    contractId: {
      type: Schema.Types.ObjectId,
      ref: 'Contract',
      required: true, 
    },

    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true, 
    },

    revieweeId: {
      type:  Schema.Types.ObjectId,
      ref: 'User',
      required: true, 
    },

    reviewerRole: {
      type: String,
      enum: ['client', 'freelancer'],
      required: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    isHideByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Review = model('Review', reviewSchema);
