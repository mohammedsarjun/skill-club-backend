import { Document, Types } from "mongoose";

/* ---------------- Attendance ---------------- */
export interface MeetingAttendance {
  clientJoined: boolean;
  clientLeftAt?: Date | null;
  freelancerJoined: boolean;
  freelancerLeftAt?: Date | null;
}

/* ---------------- Notes ---------------- */
export interface MeetingNotes {
  clientNotes?: string;
  freelancerNotes?: string;
}

/* ---------------- Logs ---------------- */
export interface MeetingLog {
  action: string;
  userId?: Types.ObjectId;
  role: "client" | "freelancer" | "system";
  timestamp: Date;
  details?: Record<string, any>;
}

/* ---------------- Main Meeting Interface ---------------- */
export interface IMeeting extends Document {
  contractId?: Types.ObjectId;
  clientId?: Types.ObjectId;
  freelancerId?: Types.ObjectId;
  type: 'recurring' | 'milestone' | 'fixed';
  milestoneId?: Types.ObjectId;
  deliverablesId?: Types.ObjectId;

  scheduledAt: Date;
  durationMinutes: number;
  agenda: string;

   agora: {
    channelName: String,
    createdAt: Date
  },
  status:
    | "proposed"
    | "accepted"
    | "completed"
    | "missed"
    | "partial_missed"
    | "reschedule_requested"
    | "ongoing";
    meetingType:"pre-contract" | "post-contract";
  attendance: MeetingAttendance;
  rescheduleRequestedBy: "freelancer" | "client" | null;
  rescheduleProposedTime?: Date | null;
  requestedBy?: "freelancer" | "client" | null;
  notes?: MeetingNotes;

  logs: MeetingLog[];

  createdAt: Date;
  updatedAt: Date;
}
