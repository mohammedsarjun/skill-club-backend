import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IClientChatService } from './interfaces/client-chat-service.interface';
import {
  SendMessageDTO,
  GetMessagesDTO,
  MarkAsReadDTO,
  MessageResponseDTO,
} from '../../dto/clientDTO/client-chat.dto';
import { IChatRepository } from '../../repositories/chat-repository.interface';
import { extractObjectId } from '../../utils/extract-object-id';
import { IContractRepository } from '../../repositories/interfaces/contract-repository.interface';
import { IUserRepository } from '../../repositories/interfaces/user-repository.interface';
import { ClientChatMapper } from '../../mapper/clientMapper/client-chat.mapper';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { emitNewMessage, emitMessageRead } from '../../config/socket';

@injectable()
export class ClientChatService implements IClientChatService {
  private _chatRepository: IChatRepository;
  private _contractRepository: IContractRepository;
  private _userRepository: IUserRepository;

  constructor(
    @inject('IChatRepository') chatRepository: IChatRepository,
    @inject('IContractRepository') contractRepository: IContractRepository,
    @inject('IUserRepository') userRepository: IUserRepository,
  ) {
    this._chatRepository = chatRepository;
    this._contractRepository = contractRepository;
    this._userRepository = userRepository;
  }

  async sendMessage(clientId: string, dto: SendMessageDTO): Promise<MessageResponseDTO> {
    const contract = await this._contractRepository.findContractDetailByIdForClient(
      dto.contractId,
      clientId,
    );

    if (!contract) {
      throw new AppError('Contract not found or access denied', HttpStatus.NOT_FOUND);
    }

    const client = await this._userRepository.findById(clientId);
    if (!client) {
      throw new AppError('Client not found', HttpStatus.NOT_FOUND);
    }

    const message = await this._chatRepository.createMessage({
      contractId: dto.contractId,
      senderId: clientId,
      senderRole: 'client',
      message: dto.message,
      attachments: dto.attachments,
    });

    const response = ClientChatMapper.toMessageResponseDTO(
      message,
      `${client.firstName} ${client.lastName}`,
      client.avatar,
    );

    emitNewMessage(dto.contractId, {
      senderName: `${client.clientProfile.companyName}`,
      senderAvatar: client.clientProfile.logo || '',
      contractId: message.contractId,
      messageId: message.messageId,
      senderId: message.senderId,
      senderRole: message.senderRole,
      message: message.message,
      attachments: (message.attachments || []).map((att) => ({
        fileUrl: att.fileUrl,
        fileName: att.fileName,
      })),
      sentAt: message.sentAt,
    });

    return response;
  }

  async getMessages(clientId: string, dto: GetMessagesDTO): Promise<MessageResponseDTO[]> {
    const contract = await this._contractRepository.findContractDetailByIdForClient(
      dto.contractId,
      clientId,
    );
    if (!contract) {
      throw new AppError('Contract not found or access denied', HttpStatus.NOT_FOUND);
    }

    const messages = await this._chatRepository.getMessagesByContract(
      dto.contractId,
      dto.limit,
      dto.skip,
    );

    const clientIdStr = extractObjectId(contract.clientId) || '';
    const freelancerIdStr = extractObjectId(contract.freelancerId) || '';

    const [client, freelancer] = await Promise.all([
      clientIdStr ? this._userRepository.findById(clientIdStr) : Promise.resolve(null),
      freelancerIdStr ? this._userRepository.findById(freelancerIdStr) : Promise.resolve(null),
    ]);

    const userMap = new Map<string, { name: string; avatar?: string }>();
    if (client) {
      userMap.set(clientIdStr, {
        name: `${client.firstName} ${client.lastName}`,
        avatar: client.avatar,
      });
    }
    if (freelancer) {
      userMap.set(freelancerIdStr, {
        name: `${freelancer.firstName} ${freelancer.lastName}`,
        avatar: freelancer.avatar,
      });
    }

    return ClientChatMapper.toMessageResponseDTOList(messages, userMap);
  }

  async markAsRead(clientId: string, dto: MarkAsReadDTO): Promise<void> {
    const contract = await this._contractRepository.findContractDetailByIdForClient(
      dto.contractId,
      clientId,
    );
    if (!contract) {
      throw new AppError('Contract not found or access denied', HttpStatus.NOT_FOUND);
    }

    await this._chatRepository.markMessagesAsRead(dto.contractId, clientId);

    emitMessageRead(dto.contractId, {
      contractId: dto.contractId,
      readBy: clientId,
      role: 'client',
    });
  }

  async getUnreadCount(clientId: string, contractId: string): Promise<number> {
    const contract = await this._contractRepository.findContractDetailByIdForClient(
      contractId,
      clientId,
    );
    if (!contract) {
      throw new AppError('Contract not found or access denied', HttpStatus.NOT_FOUND);
    }

    return await this._chatRepository.getUnreadCount(contractId, clientId);
  }
}
