import {
  SendMessageDTO,
  GetMessagesDTO,
  MarkAsReadDTO,
  MessageResponseDTO,
} from '../../../dto/freelancerDTO/freelancer-chat.dto';

export interface IFreelancerChatService {
  sendMessage(freelancerId: string, dto: SendMessageDTO): Promise<MessageResponseDTO>;
  getMessages(freelancerId: string, dto: GetMessagesDTO): Promise<MessageResponseDTO[]>;
  markAsRead(freelancerId: string, dto: MarkAsReadDTO): Promise<void>;
  getUnreadCount(freelancerId: string, contractId: string): Promise<number>;
}
