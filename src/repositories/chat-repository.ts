import BaseRepository from './baseRepositories/base-repository';
import { Message, IMessage, IMessageDocument } from '../models/message.model';
import { IChatRepository } from './chat-repository.interface';
import { v4 as uuidv4 } from 'uuid';

export class ChatRepository extends BaseRepository<IMessageDocument> implements IChatRepository {
  constructor() {
    super(Message);
  }

  async createMessage(data: Partial<IMessage>): Promise<IMessage> {
    const messageId = uuidv4();
    const message = await this.create({
      ...data,
      messageId,
      sentAt: new Date(),
      isRead: false,
    });
    return message.toObject() as IMessage;
  }

  async getMessagesByContract(
    contractId: string,
    limit: number = 50,
    skip: number = 0,
  ): Promise<IMessage[]> {
    const messages = await this.findAll<IMessageDocument>({ contractId }, { skip, limit });
    return messages.map((msg: IMessageDocument) => msg.toObject() as IMessage);
  }

  async markMessagesAsRead(contractId: string, receiverId: string): Promise<void> {
    await Message.updateMany(
      {
        contractId,
        senderId: { $ne: receiverId },
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    );
  }

  async getUnreadCount(contractId: string, receiverId: string): Promise<number> {
    return await this.count({
      contractId,
      senderId: { $ne: receiverId },
      isRead: false,
    });
  }

  async getMessageById(messageId: string): Promise<IMessage | null> {
    const message = await this.findOne<IMessageDocument>({ messageId });
    return message ? (message.toObject() as IMessage) : null;
  }

  async getRecentMessagesByContracts(contractIds: string[], limit: number): Promise<IMessage[]> {
    const messages = await this.model
      .find({ contractId: { $in: contractIds } })
      .sort({ sentAt: -1 })
      .limit(limit)
      .lean();
    
    return messages as IMessage[];
  }
}
