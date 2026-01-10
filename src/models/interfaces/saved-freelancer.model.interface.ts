import mongoose, { Document } from 'mongoose';

export interface ISavedFreelancer extends Document {
  clientId: mongoose.Types.ObjectId;
  freelancerId: mongoose.Types.ObjectId;
  createdAt: Date;
}
