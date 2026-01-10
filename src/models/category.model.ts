import mongoose, { Model, Schema } from 'mongoose';
import { ICategory } from './interfaces/category.model.interface';

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
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

export const categoryModel: Model<ICategory> = mongoose.model<ICategory>(
  'category',
  categorySchema,
);
