import { Document } from 'mongoose';

export interface IContent extends Document {
  _id: string;
  slug: string;
  title: string;
  content: string;
  icon: string;
  isPublished: boolean;
  lastUpdatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}
