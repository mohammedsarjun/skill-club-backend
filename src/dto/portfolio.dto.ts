import { Types } from 'mongoose';

export interface CreatePortfolioDto {
  freelancerId: Types.ObjectId;
  title: string;
  description: string;
  technologies: [string];
  role: string;
  projectUrl: string;
  githubUrl: string;
  images: [string];
  video: string;
}

export interface PortfolioDto {
  id: string;
  title: string;
  description: string;
  technologies: [string];
  role: string;
  projectUrl: string;
  githubUrl: string;
  images: [string];
  video: string;
}
