import mongoose, { Model, Schema } from 'mongoose';
import { ISpeciality } from './interfaces/speciality.model.interface';

const specialitySchema = new Schema<ISpeciality>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'category',
      required: true,
    },
    status: {
      type: String,
      enum: ['list', 'unlist'],
      default: 'list',
    },
  },
  { timestamps: true },
);

export const specialityModel: Model<ISpeciality> = mongoose.model<ISpeciality>(
  'speciality',
  specialitySchema,
);
