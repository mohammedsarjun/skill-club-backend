import { Types } from 'mongoose';

export interface CreateNotificationInputDto {
  userId: Types.ObjectId;

  role: 'client' | 'freelancer';

  title: string;

  message: string;

  type: 'job' | 'payment' | 'report' | 'system' | 'admin' | 'meeting';

  relatedId?: string | null;

  actionUrl?: string | null;
}
