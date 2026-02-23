import { Document, Types } from 'mongoose';

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
