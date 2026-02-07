import mongoose, { Document } from 'mongoose';
import {
  IMeeting,
  MeetingAttendance,
  MeetingLog,
  MeetingNotes,
} from './interfaces/meeting.model.interface';

const { Schema } = mongoose;
export interface IMeetingDocument extends Document, IMeeting {}
/* ---------------- Attendance Subschema ---------------- */
const attendanceSchema = new Schema<MeetingAttendance>(
  {
    clientJoined: {
      type: Boolean,
      default: false,
    },
    clientLeftAt: {
      type: Date,
    },
    freelancerJoined: {
      type: Boolean,
      default: false,
    },
    freelancerLeftAt: {
      type: Date,
    },
  },
  { _id: false },
);

/* ---------------- Logs Subschema ---------------- */
const meetingLogSchema = new Schema<MeetingLog>(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['client', 'freelancer', 'system'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    details: {
      type: Schema.Types.Mixed,
    },
  },
  { _id: false },
);

/* ---------------- Notes Subschema ---------------- */
const notesSchema = new Schema<MeetingNotes>(
  {
    clientNotes: {
      type: String,
      trim: true,
    },
    freelancerNotes: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

/* ---------------- Main Meeting Schema ---------------- */
const meetingSchema = new Schema<IMeeting>(
  {
    contractId: {
      type: Schema.Types.ObjectId,
      ref: 'Contract',
      index: true,
    },

    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    freelancerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },

    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },

    agenda: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 500,
    },

    agora: {
      channelName: { type: String },
      createdAt: { type: Date },
    },

    status: {
      type: String,
      enum: [
        'proposed',
        'accepted',
        'rejected',
        'ongoing',
        'completed',
        'cancelled',
        'rescheduled_requested',
      ],
      default: 'proposed',
      index: true,
    },
    meetingType: {
      type: String,
      enum: ['pre-contract', 'post-contract'],
      default: 'pre-contract',
      index: true,
    },

    attendance: {
      type: attendanceSchema,
      default: () => ({}),
    },

    rescheduleRequestedBy: {
      type: String,
      enum: ['freelancer', 'client'],
      default: null,
    },

    rescheduleProposedTime: {
      type: Date,
      default: null,
    },
    requestedBy: {
      type: String,
      enum: ['freelancer', 'client'],
      default: null,
    },

    notes: {
      type: notesSchema,
      default: () => ({}),
    },

    logs: {
      type: [meetingLogSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

/* ---------------- Indexes (Performance) ---------------- */
meetingSchema.index({ contractId: 1, scheduledAt: 1 });
meetingSchema.index({ status: 1 });

export default mongoose.model('Meeting', meetingSchema);
