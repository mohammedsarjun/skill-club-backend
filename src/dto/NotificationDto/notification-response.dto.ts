export interface NotificationResponseDto {
  _id: string;
  userId: string;
  role: 'client' | 'freelancer';
  title: string;
  message: string;
  type: 'job' | 'payment' | 'report' | 'system' | 'admin' | 'meeting';
  isRead: boolean;
  relatedId?: string;
  actionUrl?: string;
  createdAt: Date;
}

export interface NotificationListResponseDto {
  notifications: NotificationResponseDto[];
  unreadCount: number;
  totalCount: number;
}
