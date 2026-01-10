import { Document } from 'mongoose';
import { Types } from 'mongoose';
export interface IPortfolio extends Document {
  _id: Types.ObjectId;
  freelancerId: Types.ObjectId;
  title: string;
  description: string;
  technologies: [string];
  role: string;
  projectUrl: string;
  githubUrl: string;
  images: [string];
  video: string;
  createdAt: Date;
  updatedAt: Date;
}
