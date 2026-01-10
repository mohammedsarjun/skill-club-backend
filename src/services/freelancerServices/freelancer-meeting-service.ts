import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IFreelancerMeetingService } from './interfaces/freelancer-meeting-service.interface';
import { IContractRepository } from '../../repositories/interfaces/contract-repository.interface';
import { IMeetingRepository } from '../../repositories/interfaces/meeting-repository.interface';
import {
  FreelancerMeetingListResultDTO,
  FreelancerMeetingQueryParamsDTO,
  FreelancerMeetingDetailDTO,
  AcceptMeetingDTO,
  RequestRescheduleDTO,
  FreelancerMeetingProposalRequestDTO,
  FreelancerMeetingProposalResponseDTO,
  FreelancerMeetingListItemDTO,
} from '../../dto/freelancerDTO/freelancer-meeting.dto';
import {
  mapMeetingToFreelancerListItemDTO,
  mapMeetingToFreelancerDetailDTO,
  mapMeetingToFreelancerMeetingProposalResponseDTO,
} from '../../mapper/freelancerMapper/freelancer-meeting.mapper';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { Types } from 'mongoose';
import { generateAgoraToken } from '../../utils/agora';

@injectable()
export class FreelancerMeetingService implements IFreelancerMeetingService {
  private _contractRepository: IContractRepository;
  private _meetingRepository: IMeetingRepository;

  constructor(
    @inject('IContractRepository') contractRepository: IContractRepository,
    @inject('IMeetingRepository') meetingRepository: IMeetingRepository,
  ) {
    this._contractRepository = contractRepository;
    this._meetingRepository = meetingRepository;
  }

  async getAllMeetings(
    freelancerId: string,
    query: FreelancerMeetingQueryParamsDTO,
  ): Promise<FreelancerMeetingListResultDTO> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancerId', HttpStatus.BAD_REQUEST);
    }

    const normalizedQuery: FreelancerMeetingQueryParamsDTO = {
      page: query.page && query.page > 0 ? query.page : 1,
      limit: query.limit && query.limit > 0 ? query.limit : 10,
      status: query.status,
    };

    const contracts = await this._contractRepository.findAllForFreelancer(freelancerId, {
      page: 1,
      limit: 1000,
      filters: {},
    });

    const contractIds = contracts.map((c) => c._id?.toString()).filter((id): id is string => !!id);

    if (contractIds.length === 0) {
      return {
        items: [],
        page: normalizedQuery.page!,
        limit: normalizedQuery.limit!,
        total: 0,
        pages: 0,
      };
    }

    const [meetings, total] = await Promise.all([
      this._meetingRepository.findAllForFreelancer(contractIds, normalizedQuery),
      this._meetingRepository.countForFreelancer(contractIds, normalizedQuery),
    ]);

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

        return mapMeetingToFreelancerListItemDTO(meeting, populatedContract);
      }),
    );

    return {
      items,
      page: normalizedQuery.page!,
      limit: normalizedQuery.limit!,
      total,
      pages: Math.ceil(total / normalizedQuery.limit!),
    };
  }

  async getMeetingDetail(freelancerId: string, meetingId: string): Promise<FreelancerMeetingDetailDTO> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancerId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(meetingId)) {
      throw new AppError('Invalid meetingId', HttpStatus.BAD_REQUEST);
    }

    const contracts = await this._contractRepository.findAllForFreelancer(freelancerId, {
      page: 1,
      limit: 1000,
      filters: {},
    });

    const contractIds = contracts.map((c) => c._id?.toString()).filter((id): id is string => !!id);

    if (contractIds.length === 0) {
      throw new AppError('No contracts found for freelancer', HttpStatus.NOT_FOUND);
    }

    const meeting = await this._meetingRepository.findDetailByIdForFreelancer(meetingId, contractIds);

    if (!meeting) {
      throw new AppError('Meeting not found', HttpStatus.NOT_FOUND);
    }

    const contract = await this._contractRepository.findById(meeting.contractId?.toString() || '');

    if (!contract) {
      throw new AppError('Contract not found for meeting', HttpStatus.NOT_FOUND);
    }

    return mapMeetingToFreelancerDetailDTO(meeting, contract);
  }

  async getContractMeetings(freelancerId: string, contractId: string): Promise<FreelancerMeetingListItemDTO[]> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancerId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(contractId);
    if (!contract) {
      throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    }

    if (contract.freelancerId.toString() !== freelancerId) {
      throw new AppError('Unauthorized to view meetings for this contract', HttpStatus.FORBIDDEN);
    }

    const meetings = await this._meetingRepository.findAllForContract(contractId);

    return meetings.map((meeting) => mapMeetingToFreelancerListItemDTO(meeting, contract));
  }

  async acceptMeeting(freelancerId: string, data: AcceptMeetingDTO): Promise<void> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancerId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(data.meetingId)) {
      throw new AppError('Invalid meetingId', HttpStatus.BAD_REQUEST);
    }

    const contracts = await this._contractRepository.findAllForFreelancer(freelancerId, {
      page: 1,
      limit: 1000,
      filters: {},
    });

    const contractIds = contracts.map((c) => c._id?.toString()).filter((id): id is string => !!id);

    const meeting = await this._meetingRepository.findDetailByIdForFreelancer(data.meetingId, contractIds);

    if (!meeting) {
      throw new AppError('Meeting not found', HttpStatus.NOT_FOUND);
    }

    if (meeting.status !== 'proposed') {
      throw new AppError('Only proposed meetings can be accepted', HttpStatus.BAD_REQUEST);
    }

    const updatedMeeting = await this._meetingRepository.acceptMeeting(data.meetingId);

    if (!updatedMeeting) {
      throw new AppError('Failed to accept meeting', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async requestReschedule(freelancerId: string, data: RequestRescheduleDTO): Promise<void> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancerId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(data.meetingId)) {
      throw new AppError('Invalid meetingId', HttpStatus.BAD_REQUEST);
    }

    const contracts = await this._contractRepository.findAllForFreelancer(freelancerId, {
      page: 1,
      limit: 1000,
      filters: {},
    });

    const contractIds = contracts.map((c) => c._id?.toString()).filter((id): id is string => !!id);

    const meeting = await this._meetingRepository.findDetailByIdForFreelancer(data.meetingId, contractIds);

    if (!meeting) {
      throw new AppError('Meeting not found', HttpStatus.NOT_FOUND);
    }

    if (meeting.status !== 'proposed' && meeting.status !== 'accepted') {
      throw new AppError('Only proposed or accepted meetings can be rescheduled', HttpStatus.BAD_REQUEST);
    }

    const updatedMeeting = await this._meetingRepository.requestReschedule(data.meetingId, data.proposedTime);

    if (!updatedMeeting) {
      throw new AppError('Failed to request reschedule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async rejectMeeting(freelancerId: string, data: { meetingId: string; reason: string }): Promise<void> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancerId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(data.meetingId)) {
      throw new AppError('Invalid meetingId', HttpStatus.BAD_REQUEST);
    }

    const contracts = await this._contractRepository.findAllForFreelancer(freelancerId, {
      page: 1,
      limit: 1000,
      filters: {},
    });

    const contractIds = contracts.map((c) => c._id?.toString()).filter((id): id is string => !!id);

    const meeting = await this._meetingRepository.findDetailByIdForFreelancer(data.meetingId, contractIds);

    if (!meeting) {
      throw new AppError(ERROR_MESSAGES.MEETING.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (meeting.status !== 'proposed') {
      throw new AppError(ERROR_MESSAGES.MEETING.INVALID_STATUS, HttpStatus.BAD_REQUEST);
    }

    const updated = await this._meetingRepository.rejectMeeting(data.meetingId, freelancerId, data.reason);

    if (!updated) {
      throw new AppError(ERROR_MESSAGES.MEETING.REJECT_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async proposeMeeting(
    freelancerId: string,
    contractId: string,
    meetingData: FreelancerMeetingProposalRequestDTO,
  ): Promise<FreelancerMeetingProposalResponseDTO> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancerId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    if (!meetingData.durationMinutes || meetingData.durationMinutes < 15 || meetingData.durationMinutes > 240) {
      throw new AppError('Duration must be between 15 and 240 minutes', HttpStatus.BAD_REQUEST);
    }

    if (!meetingData.agenda || meetingData.agenda.trim().length < 10 || meetingData.agenda.trim().length > 500) {
      throw new AppError('Agenda must be between 10 and 500 characters', HttpStatus.BAD_REQUEST);
    }

    if (!meetingData.type || !['milestone', 'fixed'].includes(meetingData.type)) {
      throw new AppError('Meeting type must be either milestone or fixed', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(contractId);
    if (!contract) {
      throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    }

    if (contract.freelancerId.toString() !== freelancerId) {
      throw new AppError('Unauthorized to create meeting for this contract', HttpStatus.FORBIDDEN);
    }

    const scheduledAt = new Date(meetingData.scheduledAt);
    const now = new Date();
    if (scheduledAt <= now) {
      throw new AppError('Meeting must be scheduled in the future', HttpStatus.BAD_REQUEST);
    }

      const isMeetingAlreadyProposed = await this._meetingRepository.isMeetingAlreadyProposed(
        contractId,
        meetingData.milestoneId,
        meetingData.deliverableId
      );

    if (isMeetingAlreadyProposed) {
      throw new AppError(
        'A meeting has already been proposed for this contract',
        HttpStatus.CONFLICT
      );
    }

    const conflicts = await this._meetingRepository.findConflictingMeetings(
      contractId,
      scheduledAt,
      meetingData.durationMinutes
    );

    if (conflicts.length > 0) {
      throw new AppError(
        'A meeting is already scheduled during this time slot',
        HttpStatus.CONFLICT
      );
    }

    const meetingPayload: Record<string, unknown> = {
      contractId,
      scheduledAt,
      durationMinutes: meetingData.durationMinutes,
      agenda: meetingData.agenda,
      status: 'proposed',
      requestedBy: 'freelancer',
      logs: [
        {
          action: 'Meeting proposed by freelancer',
          userId: freelancerId,
          role: 'freelancer',
          timestamp: new Date(),
          details: {
            scheduledAt,
            durationMinutes: meetingData.durationMinutes,
            type: meetingData.type,
            agenda: meetingData.agenda,
          },
        },
      ],
    };

    const meeting = await this._meetingRepository.createMeeting(meetingPayload);
    return mapMeetingToFreelancerMeetingProposalResponseDTO(meeting);
  }

  async approveReschedule(freelancerId: string, data: { meetingId: string }): Promise<void> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError(ERROR_MESSAGES.INVALID_ID, HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(data.meetingId)) {
      throw new AppError(ERROR_MESSAGES.INVALID_ID, HttpStatus.BAD_REQUEST);
    }

    const meeting = await this._meetingRepository.findById(data.meetingId);
    if (!meeting) {
      throw new AppError(ERROR_MESSAGES.MEETING.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const contract = await this._contractRepository.findById(meeting.contractId.toString());
    if (!contract) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (contract.freelancerId.toString() !== freelancerId) {
      throw new AppError(ERROR_MESSAGES.MEETING.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    if (meeting.status !== 'reschedule_requested') {
      throw new AppError(ERROR_MESSAGES.MEETING.INVALID_STATUS, HttpStatus.BAD_REQUEST);
    }

    if (meeting.rescheduleRequestedBy !== 'client') {
      throw new AppError(ERROR_MESSAGES.MEETING.INVALID_STATUS, HttpStatus.BAD_REQUEST);
    }

    const updated = await this._meetingRepository.approveRescheduleByFreelancer(
      data.meetingId,
      freelancerId,
    );

    if (!updated) {
      throw new AppError(ERROR_MESSAGES.MEETING.UPDATE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async declineReschedule(
    freelancerId: string,
    data: { meetingId: string; reason: string },
  ): Promise<void> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError(ERROR_MESSAGES.INVALID_ID, HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(data.meetingId)) {
      throw new AppError(ERROR_MESSAGES.INVALID_ID, HttpStatus.BAD_REQUEST);
    }

    if (!data.reason || data.reason.trim().length === 0) {
      throw new AppError('Decline reason is required', HttpStatus.BAD_REQUEST);
    }

    const meeting = await this._meetingRepository.findById(data.meetingId);
    if (!meeting) {
      throw new AppError(ERROR_MESSAGES.MEETING.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const contract = await this._contractRepository.findById(meeting.contractId.toString());
    if (!contract) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (contract.freelancerId.toString() !== freelancerId) {
      throw new AppError(ERROR_MESSAGES.MEETING.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    if (meeting.status !== 'reschedule_requested') {
      throw new AppError(ERROR_MESSAGES.MEETING.INVALID_STATUS, HttpStatus.BAD_REQUEST);
    }

    if (meeting.rescheduleRequestedBy !== 'client') {
      throw new AppError(ERROR_MESSAGES.MEETING.INVALID_STATUS, HttpStatus.BAD_REQUEST);
    }

    const updated = await this._meetingRepository.declineRescheduleByFreelancer(
      data.meetingId,
      freelancerId,
      data.reason,
    );

    if (!updated) {
      throw new AppError(ERROR_MESSAGES.MEETING.UPDATE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async counterReschedule(
    freelancerId: string,
    data: { meetingId: string; proposedTime: string },
  ): Promise<void> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError(ERROR_MESSAGES.INVALID_ID, HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(data.meetingId)) {
      throw new AppError(ERROR_MESSAGES.INVALID_ID, HttpStatus.BAD_REQUEST);
    }

    const proposedTime = new Date(data.proposedTime);
    if (isNaN(proposedTime.getTime())) {
      throw new AppError('Invalid proposed time', HttpStatus.BAD_REQUEST);
    }

    const now = new Date();
    if (proposedTime <= now) {
      throw new AppError('Proposed time must be in the future', HttpStatus.BAD_REQUEST);
    }

    const meeting = await this._meetingRepository.findById(data.meetingId);
    if (!meeting) {
      throw new AppError(ERROR_MESSAGES.MEETING.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const contract = await this._contractRepository.findById(meeting.contractId.toString());
    if (!contract) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (contract.freelancerId.toString() !== freelancerId) {
      throw new AppError(ERROR_MESSAGES.MEETING.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    if (meeting.status !== 'reschedule_requested') {
      throw new AppError(ERROR_MESSAGES.MEETING.INVALID_STATUS, HttpStatus.BAD_REQUEST);
    }

    if (meeting.rescheduleRequestedBy !== 'client') {
      throw new AppError(ERROR_MESSAGES.MEETING.INVALID_STATUS, HttpStatus.BAD_REQUEST);
    }

    const updated = await this._meetingRepository.requestRescheduleByFreelancer(
      data.meetingId,
      proposedTime,
    );

    if (!updated) {
      throw new AppError(ERROR_MESSAGES.MEETING.UPDATE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async joinMeeting(
    _freelancerId: string,
    meetingId: string,
  ): Promise<{ channelName: string; token: string; appId: string; uid: string }> {
    const meeting = await this._meetingRepository.findById(meetingId);
    if (!meeting) {
      throw new AppError(ERROR_MESSAGES.MEETING.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (meeting.status !== 'ongoing') {
      throw new AppError('Cannot join a meeting that is not ongoing', HttpStatus.BAD_REQUEST);
    }
    const endTime = new Date(meeting.scheduledAt);
    endTime.setMinutes(endTime.getMinutes() + meeting.durationMinutes);
    const remainingSeconds = Math.floor((endTime.getTime() - Date.now()) / 1000);

    const token = generateAgoraToken({
      channelName: meetingId,
      account: _freelancerId,
      expireSeconds: remainingSeconds > 0 ? remainingSeconds : 3600,
    });

    return {
      token,
      channelName: meetingId,
      appId: process.env.AGORA_APP_ID!,
      uid: _freelancerId
    };
  }
}
