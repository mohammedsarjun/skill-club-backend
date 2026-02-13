import mongoose, { Schema } from 'mongoose';
import { IContractActivity } from './interfaces/contract-activity.interface';

const ContractActivitySchema = new Schema<IContractActivity>(
  {
    contractId: {
      type: Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
      index: true,
    },

    actor: {
      role: {
        type: String,
        enum: ['client', 'freelancer', 'system', 'admin'],
        required: true,
      },

      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    },

    eventType: {
      type: String,
      enum: [
        'contract_created',
        'fixed_contract_funded',
        'milestone_funded',
        'hourly_contract_funded',
        'deliverable_submitted',
        'deliverable_approved',
        'deliverable_rejected',
        'revision_requested',
        'work_logged',
        'work_log_approved',
        'work_log_rejected',
        'milestone_completed',
        'payment_released',
        'dispute_raised',
        'meeting_attended',
      ],
      required: true,
      index: true,
    },

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

    metadata: {
      amount: {
        type: Number,
        min: 0,
      },

      milestoneId: {
        type: Schema.Types.ObjectId,
        ref: 'Milestone',
      },

      messageId: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
      },

      reason: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false, // 🔒 activity logs must be immutable
    },
  },
);

const ContractActivity = mongoose.model<IContractActivity>(
  'ContractActivity',
  ContractActivitySchema,
);

export default ContractActivity;
