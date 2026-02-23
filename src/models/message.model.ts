import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  messageId: string;
  contractId: string;
  senderId: string;
  senderRole: 'client' | 'freelancer';
  message: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
  }[];
  sentAt: Date;
  readAt?: Date;
  isRead: boolean;
}

export interface IMessageDocument extends Document, IMessage {}

const messageSchema = new Schema<IMessageDocument>(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
    },
    contractId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      required: true,
      enum: ['client', 'freelancer'],
    },
    message: {
      type: String,
      default: "",
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileSize: Number,
        fileType: String,
      },
    ],
    sentAt: {
      type: Date,
      default: Date.now,
    },
    readAt: {
      type: Date,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ contractId: 1, sentAt: -1 });

export const Message = mongoose.model<IMessageDocument>('Message', messageSchema);
