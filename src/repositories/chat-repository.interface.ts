import { IMessage } from '../models/message.model';

export interface IChatRepository {
  createMessage(data: Partial<IMessage>): Promise<IMessage>;
  getMessagesByContract(contractId: string, limit?: number, skip?: number): Promise<IMessage[]>;
  markMessagesAsRead(contractId: string, receiverId: string): Promise<void>;
  getUnreadCount(contractId: string, receiverId: string): Promise<number>;
  getMessageById(messageId: string): Promise<IMessage | null>;
  getRecentMessagesByContracts(contractIds: string[], limit: number): Promise<IMessage[]>;
}
