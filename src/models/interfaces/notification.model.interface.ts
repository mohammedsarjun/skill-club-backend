import { Document, Types } from 'mongoose';

export interface INotification extends Document {
  _id: Types.ObjectId;

  userId: Types.ObjectId;

  role: 'client' | 'freelancer';

  title: string;

  message: string;

  type: 'job' | 'payment' | 'report' | 'system' | 'admin' | 'meeting';

  isRead: boolean;

  relatedId?: string | null;

  actionUrl?: string | null;

  createdAt: Date; // stored as a Date in mongoose
}
