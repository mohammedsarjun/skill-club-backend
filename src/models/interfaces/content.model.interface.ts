import { Document, Types } from 'mongoose';

export interface IContent extends Document {
  _id: Types.ObjectId;
  slug: string;
  title: string;
  content: string;
  icon: string;
  isPublished: boolean;
  lastUpdatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}
