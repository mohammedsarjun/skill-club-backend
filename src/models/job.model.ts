import mongoose, { Model, Schema } from 'mongoose';
import { IJob } from './interfaces/job.model.interface';

const jobSchema: Schema<IJob> = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      ref: 'category',
    },
    specialities: {
      type: [String],
      required: true,
      validate: {
        validator: (val: string[]) => val.length >= 1 && val.length <= 3,
        message: 'A job must have between 1 and 3 specialities',
      },
      ref: 'speciality',
    },
    skills: {
      type: [String],
      required: true,
      validate: {
        validator: (val: string[]) => val.length >= 1 && val.length <= 10,
        message: 'A job must have between 1 and 10 skills',
      },
      ref: 'skill',
    },
    rateType: {
      type: String,
      enum: ['hourly', 'fixed'],
      required: true,
    },
    hourlyRate: {
      min: {
        type: Number,
        required: function (this: IJob) {
          return this.rateType === 'hourly';
        },
      },
      max: {
        type: Number,
        required: function (this: IJob) {
          return this.rateType === 'hourly';
        },
      },
      hoursPerWeek: {
        type: Number,
        required: function (this: IJob) {
          return this.rateType === 'hourly';
        },
      },
      estimatedDuration: {
        type: String,
        enum: ['1 To 3 Months', '3 To 6 Months'],
        required: function (this: IJob) {
          return this.rateType === 'hourly';
        },
      },
    },
    fixedRate: {
      min: {
        type: Number,
        required: function (this: IJob) {
          return this.rateType === 'fixed';
        },
      },
      max: {
        type: Number,
        required: function (this: IJob) {
          return this.rateType === 'fixed';
        },
      },
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending_verification', 'rejected', 'open', 'closed', 'archived', 'suspended'],

      default: 'pending_verification',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    rejectedReason: {
      type: String,
      trim: true,
    },
    suspendedReason: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

export const jobModel: Model<IJob> = mongoose.model<IJob>('Job', jobSchema);
