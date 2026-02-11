import mongoose, { Model, Schema } from 'mongoose';
import {
  IOffer,
  OfferMilestone,
  OfferReferenceFile,
  OfferReferenceLink,
  OfferTimelineEvent,
} from './interfaces/offer.model.interface';

const milestoneSchema = new Schema<OfferMilestone>(
  {
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    expectedDelivery: { type: Date, required: true },
    revisions: { type: Number, default: 0 },
  },
  { _id: false },
);

const referenceFileSchema = new Schema<OfferReferenceFile>(
  {
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
  },
  { _id: false },
);

const referenceLinkSchema = new Schema<OfferReferenceLink>(
  {
    description: { type: String, required: true },
    link: { type: String, required: true },
  },
  { _id: false },
);

const timelineEventSchema = new Schema<OfferTimelineEvent>(
  {
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'expired'],
      required: true,
    },
    at: { type: Date, required: true },
    note: { type: String },
  },
  { _id: false },
);

const offerSchema = new Schema<IOffer>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    freelancerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
    proposalId: { type: Schema.Types.ObjectId, ref: 'proposal' },
    offerType: { type: String, enum: ['direct', 'proposal'], required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    paymentType: {
      type: String,
      enum: ['fixed', 'fixed_with_milestones', 'hourly'],
      required: true,
    },
    budget: { type: Number },
    hourlyRate: { type: Number },
    estimatedHoursPerWeek: { type: Number },
    milestones: [milestoneSchema],
    revisions: { type: Number, default: 0 },
    expectedStartDate: { type: Date },
    expectedEndDate: { type: Date },
    categoryId: { type: Schema.Types.ObjectId, ref: 'category', required: true },
    reporting: {
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
      dueTimeUtc: { type: String, required: true },
      dueDayOfWeek: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        required: false,
      },
      dueDayOfMonth: { type: Number, min: 1, max: 31, required: false },
      format: {
        type: String,
        enum: ['text_with_attachments', 'text_only', 'video'],
        required: true,
      },
    },
    referenceFiles: [referenceFileSchema],
    referenceLinks: [referenceLinkSchema],
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'expired'],
      default: 'pending',
    },
    rejectedReason: { type: String },
    timeline: [timelineEventSchema],
  },
  { timestamps: true },
);

offerSchema.index({ clientId: 1, freelancerId: 1, proposalId: 1 }, { unique: false });

export const OfferModel: Model<IOffer> = mongoose.model<IOffer>('Offer', offerSchema);
