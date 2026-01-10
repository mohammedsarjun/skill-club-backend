import mongoose, { Model, Schema } from 'mongoose';
import { IPortfolio } from './interfaces/portfolio.model.interface';

const portfolioSchema = new Schema<IPortfolio>(
  {
    freelancerId: { type: Schema.Types.ObjectId, ref: 'freelancer', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    technologies: { type: [String], default: [] },
    role: { type: String, required: true, trim: true },
    projectUrl: { type: String, trim: true },
    githubUrl: { type: String, trim: true },
    images: { type: [String], default: [] },
    video: { type: String, default: '' },
  },
  { timestamps: true },
);

export const portfolioModel: Model<IPortfolio> = mongoose.model<IPortfolio>(
  'portfolio',
  portfolioSchema,
);
