export interface SendMessageDTO {
  contractId: string;
  message: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
  }[];
}

export interface GetMessagesDTO {
  contractId: string;
  limit?: number;
  skip?: number;
}

export interface MarkAsReadDTO {
  contractId: string;
}

export interface MessageResponseDTO {
  messageId: string;
  contractId: string;
  senderId: string;
  senderRole: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
  }[];
  sentAt: string;
  readAt?: string;
  isRead: boolean;
}
