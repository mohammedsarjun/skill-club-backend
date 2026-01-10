import {
  SendMessageDTO,
  GetMessagesDTO,
  MarkAsReadDTO,
  MessageResponseDTO,
} from '../../../dto/clientDTO/client-chat.dto';

export interface IClientChatService {
  sendMessage(clientId: string, dto: SendMessageDTO): Promise<MessageResponseDTO>;
  getMessages(clientId: string, dto: GetMessagesDTO): Promise<MessageResponseDTO[]>;
  markAsRead(clientId: string, dto: MarkAsReadDTO): Promise<void>;
  getUnreadCount(clientId: string, contractId: string): Promise<number>;
}
