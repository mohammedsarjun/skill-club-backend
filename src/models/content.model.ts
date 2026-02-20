import mongoose, { Model, Schema } from 'mongoose';
import { IContent } from './interfaces/content.model.interface';

const contentSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: '📄',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    lastUpdatedBy: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);

export const contentModel: Model<IContent> = mongoose.model<IContent>('content', contentSchema);
