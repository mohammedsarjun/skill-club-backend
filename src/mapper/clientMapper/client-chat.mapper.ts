import { IMessage } from '../../models/message.model';
import { MessageResponseDTO } from '../../dto/clientDTO/client-chat.dto';

export class ClientChatMapper {
  static toMessageResponseDTO(
    message: IMessage,
    senderName: string,
    senderAvatar?: string,
  ): MessageResponseDTO {
    return {
      messageId: message.messageId,
      contractId: message.contractId,
      senderId: message.senderId,
      senderRole: message.senderRole,
      senderName,
      senderAvatar,
      message: message.message,
      attachments: message.attachments,
      sentAt: message.sentAt.toISOString(),
      readAt: message.readAt?.toISOString(),
      isRead: message.isRead,
    };
  }

  static toMessageResponseDTOList(
    messages: IMessage[],
    userMap: Map<string, { name: string; avatar?: string }>,
  ): MessageResponseDTO[] {
    return messages.map((msg) => {
      const user = userMap.get(msg.senderId);
      return this.toMessageResponseDTO(msg, user?.name || 'Unknown', user?.avatar);
    });
  }
}
