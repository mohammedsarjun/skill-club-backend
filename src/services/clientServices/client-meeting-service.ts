import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IClientMeetingService } from './interfaces/client-meeting-service.interface';
import { IMeetingRepository } from '../../repositories/interfaces/meeting-repository.interface';
import {
  ClientMeetingProposalRequestDTO,
  ClientMeetingProposalResponseDTO,
  ClientMeetingListItemDTO,
  ClientMeetingQueryParamsDTO,
  ClientMeetingListResultDTO,
  ClientPreContractMeetingRequestDTO,
  ClientPreContractMeetingResponseDTO,
} from '../../dto/clientDTO/client-meeting.dto';
import {
  mapMeetingToClientMeetingProposalResponseDTO,
  mapMeetingToClientMeetingListItemDTO,
  mapPreContractMeetingToClientListItemDTO,
} from '../../mapper/clientMapper/client-meeting.mapper';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { IContractRepository } from '../../repositories/interfaces/contract-repository.interface';
import { IUserRepository } from '../../repositories/interfaces/user-repository.interface';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { Types } from 'mongoose';
import { generateAgoraToken } from '../../utils/agora';

@injectable()
export class ClientMeetingService implements IClientMeetingService {
  private _meetingRepository: IMeetingRepository;
  private _contractRepository: IContractRepository;
  private _userRepository: IUserRepository;
  constructor(
    @inject('IMeetingRepository') meetingRepository: IMeetingRepository,
    @inject('IContractRepository') contractRepository: IContractRepository,
    @inject('IUserRepository') userRepository: IUserRepository,
  ) {
    this._meetingRepository = meetingRepository;
    this._contractRepository = contractRepository;
    this._userRepository = userRepository;
  }

  async proposeMeeting(
    clientId: string,
    contractId: string,
    meetingData: ClientMeetingProposalRequestDTO,
  ): Promise<ClientMeetingProposalResponseDTO> {
    if (!meetingData.scheduledAt) {
      throw new AppError('Meeting scheduled time is required', HttpStatus.BAD_REQUEST);
    }

    if (!meetingData.durationMinutes || ![15, 30, 45].includes(meetingData.durationMinutes)) {
      throw new AppError('Duration must be 15, 30, or 45 minutes', HttpStatus.BAD_REQUEST);
    }

    if (!meetingData.agenda || meetingData.agenda.trim().length < 10) {
      throw new AppError('Agenda must be at least 10 characters', HttpStatus.BAD_REQUEST);
    }

    if (meetingData.agenda.length > 500) {
      throw new AppError('Agenda must not exceed 500 characters', HttpStatus.BAD_REQUEST);
    }

    // if (meetingData.type === 'fixed' && !meetingData.deliverablesId) {
    //   throw new AppError('Deliverable ID is required for fixed deliverable meetings', HttpStatus.BAD_REQUEST);
    // }

    const contract = await this._contractRepository.findById(contractId);
    if (!contract) {
      throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    }

    if (contract.clientId.toString() !== clientId) {
      throw new AppError('Unauthorized to create meeting for this contract', HttpStatus.FORBIDDEN);
    }

    const scheduledAt = new Date(meetingData.scheduledAt);
    const now = new Date();
    if (scheduledAt <= now) {
      throw new AppError('Meeting must be scheduled in the future', HttpStatus.BAD_REQUEST);
    }

    // console.log(contractId, meetingData.type, clientId, meetingData.milestoneId, meetingData.deliverableId);

    const isMeetingAlreadyProposed = await this._meetingRepository.isMeetingAlreadyProposed(
      contractId,
      meetingData.milestoneId,
      meetingData.deliverableId,
    );

    if (isMeetingAlreadyProposed) {
      throw new AppError(
        'A meeting has already been proposed for this milestone or deliverable',
        HttpStatus.CONFLICT,
      );
    }

    const conflicts = await this._meetingRepository.findConflictingMeetings(
      contractId,
      scheduledAt,
      meetingData.durationMinutes,
    );

    if (conflicts.length > 0) {
      throw new AppError(
        'A meeting is already scheduled during this time slot',
        HttpStatus.CONFLICT,
      );
    }

    const meetingPayload: Record<string, unknown> = {
      contractId,
      deliverablesId: meetingData.deliverableId,
      scheduledAt,
      durationMinutes: meetingData.durationMinutes,
      agenda: meetingData.agenda,
      status: 'proposed',
      requestedBy: 'client',
      logs: [
        {
          action: 'Meeting proposed by client',
          userId: clientId,
          role: 'client',
          timestamp: new Date(),
          details: {
            scheduledAt,
            durationMinutes: meetingData.durationMinutes,
            agenda: meetingData.agenda,
          },
        },
      ],
    };

    const meeting = await this._meetingRepository.createMeeting(meetingPayload);
    return mapMeetingToClientMeetingProposalResponseDTO(meeting);
  }

  async acceptMeeting(clientId: string, data: { meetingId: string }): Promise<void> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError(ERROR_MESSAGES.INVALID_ID, HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(data.meetingId)) {
      throw new AppError(ERROR_MESSAGES.INVALID_ID, HttpStatus.BAD_REQUEST);
    }

    const meeting = await this._meetingRepository.findById(data.meetingId);
    if (!meeting) {
      throw new AppError(ERROR_MESSAGES.MEETING.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (meeting.contractId) {
      const contract = await this._contractRepository.findById(meeting.contractId.toString());
      if (!contract) {
        throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      if (contract.clientId.toString() !== clientId) {
        throw new AppError(ERROR_MESSAGES.MEETING.UNAUTHORIZED, HttpStatus.FORBIDDEN);
      }
    } else {
      if (!meeting.clientId || meeting.clientId.toString() !== clientId) {
        throw new AppError(ERROR_MESSAGES.MEETING.UNAUTHORIZED, HttpStatus.FORBIDDEN);
      }
    }

    if (meeting.status !== 'proposed') {
      throw new AppError(ERROR_MESSAGES.MEETING.INVALID_STATUS, HttpStatus.BAD_REQUEST);
    }

    const updated = await this._meetingRepository.acceptMeetingByClient(data.meetingId, clientId);
    if (!updated) {
      throw new AppError(ERROR_MESSAGES.MEETING.UPDATE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async rejectMeeting(
    clientId: string,
    data: { meetingId: string; reason: string },
  ): Promise<void> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError(ERROR_MESSAGES.INVALID_ID, HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(data.meetingId)) {
      throw new AppError(ERROR_MESSAGES.INVALID_ID, HttpStatus.BAD_REQUEST);
    }

    if (!data.reason || data.reason.trim().length === 0) {
      throw new AppError('Rejection reason is required', HttpStatus.BAD_REQUEST);
    }

    const meeting = await this._meetingRepository.findById(data.meetingId);
    if (!meeting) {
      throw new AppError(ERROR_MESSAGES.MEETING.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (meeting.contractId) {
      const contract = await this._contractRepository.findById(meeting.contractId.toString());
      if (!contract) {
        throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      if (contract.clientId.toString() !== clientId) {
        throw new AppError(ERROR_MESSAGES.MEETING.UNAUTHORIZED, HttpStatus.FORBIDDEN);
      }
    } else {
      if (!meeting.clientId || meeting.clientId.toString() !== clientId) {
        throw new AppError(ERROR_MESSAGES.MEETING.UNAUTHORIZED, HttpStatus.FORBIDDEN);
      }
    }

    if (meeting.status !== 'proposed') {
      throw new AppError(ERROR_MESSAGES.MEETING.INVALID_STATUS, HttpStatus.BAD_REQUEST);
    }

    const updated = await this._meetingRepository.rejectMeetingByClient(
      data.meetingId,
      clientId,
      data.reason,
    );
    if (!updated) {
      throw new AppError(ERROR_MESSAGES.MEETING.UPDATE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async approveReschedule(clientId: string, data: { meetingId: string }): Promise<void> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(data.meetingId)) {
      throw new AppError('Invalid meetingId', HttpStatus.BAD_REQUEST);
    }

    const meeting = await this._meetingRepository.findById(data.meetingId);
    if (!meeting) {
      throw new AppError(ERROR_MESSAGES.MEETING.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (!meeting.contractId) {
      throw new AppError('Meeting is not associated with a contract', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(meeting.contractId.toString());
    if (!contract || contract.clientId.toString() !== clientId) {
      throw new AppError(ERROR_MESSAGES.MEETING.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    if (
      meeting.status !== 'reschedule_requested' ||
      meeting.rescheduleRequestedBy !== 'freelancer'
    ) {
      throw new AppError(ERROR_MESSAGES.MEETING.INVALID_STATUS, HttpStatus.BAD_REQUEST);
    }

    const updated = await this._meetingRepository.approveReschedule(data.meetingId, clientId);
    if (!updated) {
      throw new AppError('Failed to approve reschedule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async declineReschedule(
    clientId: string,
    data: { meetingId: string; reason: string },
  ): Promise<void> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(data.meetingId)) {
      throw new AppError('Invalid meetingId', HttpStatus.BAD_REQUEST);
    }

    const meeting = await this._meetingRepository.findById(data.meetingId);
    if (!meeting) {
      throw new AppError(ERROR_MESSAGES.MEETING.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (!meeting.contractId) {
      throw new AppError('Meeting is not associated with a contract', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(meeting.contractId.toString());
    if (!contract || contract.clientId.toString() !== clientId) {
      throw new AppError(ERROR_MESSAGES.MEETING.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    if (
      meeting.status !== 'reschedule_requested' ||
      meeting.rescheduleRequestedBy !== 'freelancer'
    ) {
      throw new AppError(ERROR_MESSAGES.MEETING.INVALID_STATUS, HttpStatus.BAD_REQUEST);
    }

    const updated = await this._meetingRepository.declineReschedule(
      data.meetingId,
      clientId,
      data.reason,
    );
    if (!updated) {
      throw new AppError('Failed to decline reschedule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async requestReschedule(
    clientId: string,
    data: { meetingId: string; proposedTime: Date },
  ): Promise<void> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(data.meetingId)) {
      throw new AppError('Invalid meetingId', HttpStatus.BAD_REQUEST);
    }

    const meeting = await this._meetingRepository.findById(data.meetingId);
    if (!meeting) {
      throw new AppError(ERROR_MESSAGES.MEETING.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (!meeting.contractId) {
      throw new AppError('Meeting is not associated with a contract', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(meeting.contractId.toString());
    if (!contract || contract.clientId.toString() !== clientId) {
      throw new AppError(ERROR_MESSAGES.MEETING.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    if (!['proposed', 'accepted', 'reschedule_requested'].includes(meeting.status)) {
      throw new AppError(ERROR_MESSAGES.MEETING.INVALID_STATUS, HttpStatus.BAD_REQUEST);
    }

    const updated = await this._meetingRepository.requestRescheduleByClient(
      data.meetingId,
      data.proposedTime,
    );
    if (!updated) {
      throw new AppError('Failed to request reschedule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getContractMeetings(
    clientId: string,
    contractId: string,
  ): Promise<ClientMeetingListItemDTO[]> {
    const contract = await this._contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    }

    if (contract.clientId.toString() !== clientId) {
      throw new AppError('Unauthorized to view meetings for this contract', HttpStatus.FORBIDDEN);
    }

    const meetings = await this._meetingRepository.findAllForContract(contractId);

    return meetings.map((meeting) => mapMeetingToClientMeetingListItemDTO(meeting, contract));
  }

  async getAllMeetings(
    clientId: string,
    query: ClientMeetingQueryParamsDTO,
  ): Promise<ClientMeetingListResultDTO> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    }

    const normalizedQuery: ClientMeetingQueryParamsDTO = {
      page: query.page && query.page > 0 ? query.page : 1,
      limit: query.limit && query.limit > 0 ? query.limit : 10,
      status: query.status,
      meetingType: query.meetingType,
      requestedBy: query.requestedBy,
      rescheduleRequestedBy: query.rescheduleRequestedBy,
      isExpired: query.isExpired,
    };

    // When filtering for expired meetings, only fetch 'proposed' status
    const repositoryQuery = { ...normalizedQuery };
    if (normalizedQuery.isExpired !== undefined) {
      repositoryQuery.status = 'proposed';
    }

    const [postContractMeetings, preContractMeetings] = await Promise.all([
      this.getPostContractMeetings(clientId, repositoryQuery),
      this.getPreContractMeetings(clientId, repositoryQuery),
    ]);

    let allMeetings = [...postContractMeetings, ...preContractMeetings];

    if (normalizedQuery.isExpired !== undefined) {
      const now = new Date();
      allMeetings = allMeetings.filter((meeting) => {
        const isExpired = new Date(meeting.scheduledAt) < now;
        return normalizedQuery.isExpired ? isExpired : !isExpired;
      });
    }

    allMeetings.sort((a, b) => 
      new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );

    const startIndex = (normalizedQuery.page! - 1) * normalizedQuery.limit!;
    const endIndex = startIndex + normalizedQuery.limit!;
    const paginatedMeetings = allMeetings.slice(startIndex, endIndex);

    return {
      items: paginatedMeetings,
      page: normalizedQuery.page!,
      limit: normalizedQuery.limit!,
      total: allMeetings.length,
      pages: Math.ceil(allMeetings.length / normalizedQuery.limit!),
    };
  }

  private async getPostContractMeetings(
    clientId: string,
    query: ClientMeetingQueryParamsDTO,
  ): Promise<ClientMeetingListItemDTO[]> {
    if (query.meetingType === 'pre-contract') {
      return [];
    }

    const contracts = await this._contractRepository.findAllForClient(clientId, {
      page: 1,
      limit: 1000,
      filters: {},
    });

    const contractIds = contracts.map((c) => c._id?.toString()).filter((id): id is string => !!id);

    if (contractIds.length === 0) {
      return [];
    }

    const meetings = await this._meetingRepository.findAllForClient(contractIds, query);
    const contractMap = new Map(contracts.map((c) => [c._id?.toString(), c]));

    const items = await Promise.all(
      meetings.map(async (meeting) => {
        const contract = contractMap.get(meeting.contractId?.toString() || '');
        if (!contract) {
          throw new AppError('Contract not found for meeting', HttpStatus.NOT_FOUND);
        }

        const populatedContract = await this._contractRepository.findById(contract._id!.toString());
        if (!populatedContract) {
          throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
        }

        return mapMeetingToClientMeetingListItemDTO(meeting, populatedContract);
      }),
    );

    return items;
  }

  private async getPreContractMeetings(
    clientId: string,
    query: ClientMeetingQueryParamsDTO,
  ): Promise<ClientMeetingListItemDTO[]> {
    if (query.meetingType === 'post-contract') {
      return [];
    }

    const meetings = await this._meetingRepository.findPreContractMeetingsForClient(clientId, query);

    const items = await Promise.all(
      meetings.map(async (meeting) => {
        const freelancerUser = meeting.freelancerId 
          ? await this._userRepository.findById(meeting.freelancerId.toString())
          : null;

        return mapPreContractMeetingToClientListItemDTO(meeting, freelancerUser);
      }),
    );

    return items;
  }

  async joinMeeting(
    _clientId: string,
    meetingId: string,
  ): Promise<{ channelName: string; token: string; appId: string; uid: string }> {
    const meeting = await this._meetingRepository.findById(meetingId);
    if (!meeting) {
      throw new AppError('Meeting not found', HttpStatus.NOT_FOUND);
    }

    if (meeting.status !== 'ongoing') {
      throw new AppError('Cannot join a meeting that is not ongoing', HttpStatus.BAD_REQUEST);
    }
    const endTime = new Date(meeting.scheduledAt);
    endTime.setMinutes(endTime.getMinutes() + meeting.durationMinutes);
    const remainingSeconds = Math.floor((endTime.getTime() - Date.now()) / 1000);
    // Generate Agora token
    const token = generateAgoraToken({
      channelName:meetingId, 
      account: 0 as unknown as string, 
      expireSeconds: remainingSeconds > 0 ? remainingSeconds : 3600,
    });

    return {
      token,
      channelName: meetingId,
      appId: process.env.AGORA_APP_ID!,
      uid: 0 as unknown as string,
    };
  }

  async proposePreContractMeeting(
    clientId: string,
    freelancerId: string,
    meetingData: ClientPreContractMeetingRequestDTO,
  ): Promise<ClientPreContractMeetingResponseDTO> {
    if (!meetingData.scheduledAt) {
      throw new AppError('Meeting scheduled time is required', HttpStatus.BAD_REQUEST);
    }

    if (!meetingData.durationMinutes || ![15, 30, 45, 60].includes(meetingData.durationMinutes)) {
      throw new AppError('Duration must be 15, 30, 45, or 60 minutes', HttpStatus.BAD_REQUEST);
    }

    if (!meetingData.agenda || meetingData.agenda.trim().length < 10) {
      throw new AppError('Agenda must be at least 10 characters', HttpStatus.BAD_REQUEST);
    }

    if (meetingData.agenda.length > 500) {
      throw new AppError('Agenda must not exceed 500 characters', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancer ID', HttpStatus.BAD_REQUEST);
    }

    const freelancer = await this._userRepository.findById(freelancerId);
    if (!freelancer) {
      throw new AppError('Freelancer not found', HttpStatus.NOT_FOUND);
    }

    if (!freelancer.freelancerProfile) {
      throw new AppError('User is not a freelancer', HttpStatus.BAD_REQUEST);
    }

    const scheduledAt = new Date(meetingData.scheduledAt);
    const now = new Date();
    if (scheduledAt <= now) {
      throw new AppError('Meeting must be scheduled in the future', HttpStatus.BAD_REQUEST);
    }

    const meetingPayload: Record<string, unknown> = {
      scheduledAt,
      durationMinutes: meetingData.durationMinutes,
      agenda: meetingData.agenda,
      status: 'proposed',
      requestedBy: 'client',
      meetingType: 'pre-contract',
      logs: [
        {
          action: 'Pre-contract meeting proposed by client',
          userId: clientId,
          role: 'client',
          timestamp: new Date(),
          details: {
            freelancerId,
            scheduledAt,
            durationMinutes: meetingData.durationMinutes,
            agenda: meetingData.agenda,
          },
        },
      ],
    };

    const meeting = await this._meetingRepository.createPreContractMeeting(clientId, freelancerId, meetingPayload);

    return {
      meetingId: meeting.id,
      freelancerId,
      scheduledAt: meeting.scheduledAt,
      durationMinutes: meeting.durationMinutes,
      agenda: meeting.agenda,
      meetingType: 'pre-contract',
      status: meeting.status,
      createdAt: meeting.createdAt,
    };
  }
}
