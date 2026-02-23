import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IFreelancerChatService } from './interfaces/freelancer-chat-service.interface';
import {
  SendMessageDTO,
  GetMessagesDTO,
  MarkAsReadDTO,
  MessageResponseDTO,
} from '../../dto/freelancerDTO/freelancer-chat.dto';
import { IChatRepository } from '../../repositories/chat-repository.interface';
import { IContractRepository } from '../../repositories/interfaces/contract-repository.interface';
import { IUserRepository } from '../../repositories/interfaces/user-repository.interface';
import { extractObjectId } from '../../utils/extract-object-id';
import { FreelancerChatMapper } from '../../mapper/freelancerMapper/freelancer-chat.mapper';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { emitNewMessage, emitMessageRead } from '../../config/socket';

@injectable()
export class FreelancerChatService implements IFreelancerChatService {
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

  async sendMessage(freelancerId: string, dto: SendMessageDTO): Promise<MessageResponseDTO> {
    const contract = await this._contractRepository.findDetailByIdForFreelancer(
      dto.contractId,
      freelancerId,
    );
    if (!contract) {
      throw new AppError('Contract not found or access denied', HttpStatus.NOT_FOUND);
    }

    const freelancer = await this._userRepository.findById(freelancerId);
    if (!freelancer) {
      throw new AppError('Freelancer not found', HttpStatus.NOT_FOUND);
    }

    const message = await this._chatRepository.createMessage({
      contractId: dto.contractId,
      senderId: freelancerId,
      senderRole: 'freelancer',
      message: dto.message,
      attachments: dto.attachments,
    });

    const response = FreelancerChatMapper.toMessageResponseDTO(
      message,
      `${freelancer.firstName} ${freelancer.lastName}`,
      freelancer.freelancerProfile.logo,
    );

    emitNewMessage(dto.contractId, {
      senderName: `${freelancer.firstName} ${freelancer.lastName}`,
      senderAvatar: freelancer.freelancerProfile.logo || '',
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

  async getMessages(freelancerId: string, dto: GetMessagesDTO): Promise<MessageResponseDTO[]> {
    const contract = await this._contractRepository.findDetailByIdForFreelancer(
      dto.contractId,
      freelancerId,
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

    return FreelancerChatMapper.toMessageResponseDTOList(messages, userMap);
  }

  async markAsRead(freelancerId: string, dto: MarkAsReadDTO): Promise<void> {
    const contract = await this._contractRepository.findDetailByIdForFreelancer(
      dto.contractId,
      freelancerId,
    );
    if (!contract) {
      throw new AppError('Contract not found or access denied', HttpStatus.NOT_FOUND);
    }

    await this._chatRepository.markMessagesAsRead(dto.contractId, freelancerId);

    emitMessageRead(dto.contractId, {
      contractId: dto.contractId,
      readBy: freelancerId,
      role: 'freelancer',
    });
  }

  async getUnreadCount(freelancerId: string, contractId: string): Promise<number> {
    const contract = await this._contractRepository.findDetailByIdForFreelancer(
      contractId,
      freelancerId,
    );
    if (!contract) {
      throw new AppError('Contract not found or access denied', HttpStatus.NOT_FOUND);
    }

    return await this._chatRepository.getUnreadCount(contractId, freelancerId);
  }
}
