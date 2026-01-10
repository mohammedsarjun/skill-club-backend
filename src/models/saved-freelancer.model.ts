import { Schema, model } from 'mongoose';
import { ISavedFreelancer } from './interfaces/saved-freelancer.model.interface';

const savedFreelancerSchema = new Schema<ISavedFreelancer>({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  freelancerId: {
    type: Schema.Types.ObjectId,
    ref: 'Freelancer',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

savedFreelancerSchema.index({ clientId: 1, freelancerId: 1 }, { unique: true });

const SavedFreelancer = model<ISavedFreelancer>('SavedFreelancer', savedFreelancerSchema);

export default SavedFreelancer;
