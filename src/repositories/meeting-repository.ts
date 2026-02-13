import BaseRepository from './baseRepositories/base-repository';
import meetingModel from '../models/meeting.model';
import { IMeeting } from '../models/interfaces/meeting.model.interface';
import { IMeetingRepository } from './interfaces/meeting-repository.interface';
import { ClientSession, Types } from 'mongoose';
import { FreelancerMeetingQueryParamsDTO } from '../dto/freelancerDTO/freelancer-meeting.dto';
import { ClientMeetingQueryParamsDTO } from '../dto/clientDTO/client-meeting.dto';

export class MeetingRepository extends BaseRepository<IMeeting> implements IMeetingRepository {
  constructor() {
    super(meetingModel);
  }

  async createMeeting(data: Partial<IMeeting>, session?: ClientSession): Promise<IMeeting> {
    const meeting = session ? await this.create(data, session) : await this.create(data);
    return meeting;
  }

  async createPreContractMeeting(
    clientId: string,
    freelancerId: string,
    meetingData: Record<string, unknown>,
  ): Promise<IMeeting> {
    const preContractMeetingData = {
      ...meetingData,
      clientId: new Types.ObjectId(clientId),
      freelancerId: new Types.ObjectId(freelancerId),
      meetingType: 'pre-contract' as const,
    };
    return await this.create(preContractMeetingData);
  }

  async findConflictingMeetings(
    contractId: string,
    scheduledAt: Date,
    durationMinutes: number,
  ): Promise<IMeeting[]> {
    const meetingEndTime = new Date(scheduledAt.getTime() + durationMinutes * 60 * 1000);

    const conflicts = await this.model.find({
      contractId,
      status: { $in: ['proposed', 'accepted'] },
      $or: [
        {
          scheduledAt: { $lt: meetingEndTime },
          $expr: {
            $gt: [
              { $add: ['$scheduledAt', { $multiply: ['$durationMinutes', 60000] }] },
              scheduledAt,
            ],
          },
        },
      ],
    });

    return conflicts;
  }

  async isMeetingAlreadyProposed(contractId: string): Promise<boolean> {
    const query = {
      contractId: new Types.ObjectId(contractId),
      status: 'proposed',
    };

    const existingMeeting = await this.model.findOne(query);

    return !!existingMeeting;
  }

  async hasActivePreContractMeeting(clientId: string, freelancerId: string): Promise<boolean> {
    const existingMeeting = await this.model.findOne({
      clientId: new Types.ObjectId(clientId),
      freelancerId: new Types.ObjectId(freelancerId),
      meetingType: 'pre-contract',
      status: { $in: ['proposed', 'accepted', 'ongoing'] },
    });
    return !!existingMeeting;
  }

  async findAllForFreelancer(
    freelancerContractIds: string[],
    query: FreelancerMeetingQueryParamsDTO,
  ): Promise<IMeeting[]> {
    const filter: Record<string, unknown> = {
      contractId: { $in: freelancerContractIds.map((id) => new Types.ObjectId(id)) },
    };

    if (query.status) {
      filter.status = query.status;
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const meetings = await this.model
      .find(filter)
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return meetings;
  }

  async countForFreelancer(
    freelancerContractIds: string[],
    query: FreelancerMeetingQueryParamsDTO,
  ): Promise<number> {
    const filter: Record<string, unknown> = {
      contractId: { $in: freelancerContractIds.map((id) => new Types.ObjectId(id)) },
    };

    if (query.status) {
      filter.status = query.status;
    }

    return await this.model.countDocuments(filter);
  }

  async findAllForClient(
    clientContractIds: string[],
    query: ClientMeetingQueryParamsDTO,
  ): Promise<IMeeting[]> {
    const filter: Record<string, unknown> = {
      contractId: { $in: clientContractIds.map((id) => new Types.ObjectId(id)) },
    };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.meetingType) {
      filter.meetingType = query.meetingType;
    }

    if (query.requestedBy) {
      filter.requestedBy = query.requestedBy;
    }

    if (query.rescheduleRequestedBy) {
      filter.rescheduleRequestedBy = query.rescheduleRequestedBy;
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const meetings = await this.model
      .find(filter)
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return meetings;
  }

  async countForClient(
    clientContractIds: string[],
    query: ClientMeetingQueryParamsDTO,
  ): Promise<number> {
    const filter: Record<string, unknown> = {
      contractId: { $in: clientContractIds.map((id) => new Types.ObjectId(id)) },
    };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.meetingType) {
      filter.meetingType = query.meetingType;
    }

    if (query.requestedBy) {
      filter.requestedBy = query.requestedBy;
    }

    if (query.rescheduleRequestedBy) {
      filter.rescheduleRequestedBy = query.rescheduleRequestedBy;
    }

    return await this.model.countDocuments(filter);
  }

  async findDetailByIdForFreelancer(
    meetingId: string,
    freelancerContractIds: string[],
  ): Promise<IMeeting | null> {
    const meeting = await this.model
      .findOne({
        _id: new Types.ObjectId(meetingId),
        contractId: { $in: freelancerContractIds.map((id) => new Types.ObjectId(id)) },
      })
      .exec();

    return meeting;
  }

  async acceptMeeting(meetingId: string): Promise<IMeeting | null> {
    const meeting = await this.model
      .findByIdAndUpdate(meetingId, { status: 'accepted' }, { new: true })
      .exec();

    return meeting;
  }

  async acceptMeetingByClient(meetingId: string, clientId: string): Promise<IMeeting | null> {
    const logEntry = {
      action: 'Meeting accepted by client',
      userId: clientId,
      role: 'client',
      timestamp: new Date(),
      details: {},
    };

    const meeting = await this.model
      .findByIdAndUpdate(
        meetingId,
        {
          status: 'accepted',
          $push: { logs: logEntry },
        },
        { new: true },
      )
      .exec();

    return meeting;
  }

  async rejectMeetingByClient(
    meetingId: string,
    clientId: string,
    reason: string,
  ): Promise<IMeeting | null> {
    const logEntry = {
      action: 'Meeting rejected by client',
      userId: clientId,
      role: 'client',
      timestamp: new Date(),
      details: { reason },
    };

    const meeting = await this.model
      .findByIdAndUpdate(
        meetingId,
        {
          status: 'rejected',
          $push: { logs: logEntry },
        },
        { new: true },
      )
      .exec();

    return meeting;
  }

  async requestReschedule(meetingId: string, proposedTime: Date): Promise<IMeeting | null> {
    const meeting = await this.model
      .findByIdAndUpdate(
        meetingId,
        {
          status: 'reschedule_requested',
          rescheduleRequestedBy: 'freelancer',
          rescheduleProposedTime: proposedTime,
        },
        { new: true },
      )
      .exec();

    return meeting;
  }

  async rejectMeeting(
    meetingId: string,
    freelancerId: string,
    reason: string,
  ): Promise<IMeeting | null> {
    const logEntry = {
      action: 'Meeting rejected by freelancer',
      userId: freelancerId,
      role: 'freelancer',
      timestamp: new Date(),
      details: { reason },
    };

    const meeting = await this.model
      .findByIdAndUpdate(
        meetingId,
        {
          status: 'rejected',
          $push: { logs: logEntry },
        },
        { new: true },
      )
      .exec();

    return meeting;
  }

  async approveReschedule(meetingId: string, clientId: string): Promise<IMeeting | null> {
    const meeting = await this.model.findById(meetingId).exec();
    if (!meeting || !meeting.rescheduleProposedTime) {
      return null;
    }

    const logEntry = {
      action: 'Reschedule approved by client',
      userId: clientId,
      role: 'client',
      timestamp: new Date(),
      details: {
        previousTime: meeting.scheduledAt,
        newTime: meeting.rescheduleProposedTime,
      },
    };

    const updated = await this.model
      .findByIdAndUpdate(
        meetingId,
        {
          status: 'accepted',
          scheduledAt: meeting.rescheduleProposedTime,
          rescheduleRequestedBy: null,
          rescheduleProposedTime: null,
          $push: { logs: logEntry },
        },
        { new: true },
      )
      .exec();

    return updated;
  }

  async declineReschedule(
    meetingId: string,
    clientId: string,
    reason: string,
  ): Promise<IMeeting | null> {
    const logEntry = {
      action: 'Reschedule declined by client',
      userId: clientId,
      role: 'client',
      timestamp: new Date(),
      details: { reason },
    };

    const meeting = await this.model
      .findByIdAndUpdate(
        meetingId,
        {
          status: 'rejected',
          rescheduleRequestedBy: null,
          rescheduleProposedTime: null,
          $push: { logs: logEntry },
        },
        { new: true },
      )
      .exec();

    return meeting;
  }

  async requestRescheduleByClient(meetingId: string, proposedTime: Date): Promise<IMeeting | null> {
    const meeting = await this.model
      .findByIdAndUpdate(
        meetingId,
        {
          status: 'reschedule_requested',
          rescheduleRequestedBy: 'client',
          rescheduleProposedTime: proposedTime,
        },
        { new: true },
      )
      .exec();

    return meeting;
  }

  async approveRescheduleByFreelancer(
    meetingId: string,
    freelancerId: string,
  ): Promise<IMeeting | null> {
    const logEntry = {
      action: 'Reschedule approved by freelancer',
      userId: freelancerId,
      role: 'freelancer',
      timestamp: new Date(),
      details: {},
    };

    const meeting = await this.model.findById(meetingId).exec();
    if (!meeting || !meeting.rescheduleProposedTime) {
      return null;
    }

    const updated = await this.model
      .findByIdAndUpdate(
        meetingId,
        {
          status: 'accepted',
          scheduledAt: meeting.rescheduleProposedTime,
          rescheduleRequestedBy: null,
          rescheduleProposedTime: null,
          $push: { logs: logEntry },
        },
        { new: true },
      )
      .exec();

    return updated;
  }

  async declineRescheduleByFreelancer(
    meetingId: string,
    freelancerId: string,
    reason: string,
  ): Promise<IMeeting | null> {
    const logEntry = {
      action: 'Reschedule declined by freelancer',
      userId: freelancerId,
      role: 'freelancer',
      timestamp: new Date(),
      details: { reason },
    };

    const meeting = await this.model
      .findByIdAndUpdate(
        meetingId,
        {
          status: 'rejected',
          rescheduleRequestedBy: null,
          rescheduleProposedTime: null,
          $push: { logs: logEntry },
        },
        { new: true },
      )
      .exec();

    return meeting;
  }

  async requestRescheduleByFreelancer(
    meetingId: string,
    proposedTime: Date,
  ): Promise<IMeeting | null> {
    const meeting = await this.model
      .findByIdAndUpdate(
        meetingId,
        {
          status: 'reschedule_requested',
          rescheduleRequestedBy: 'freelancer',
          rescheduleProposedTime: proposedTime,
        },
        { new: true },
      )
      .exec();

    return meeting;
  }

  async findAllForContract(contractId: string): Promise<IMeeting[]> {
    const meetings = await this.model
      .find({ contractId: new Types.ObjectId(contractId) })
      .sort({ scheduledAt: -1 })
      .exec();

    return meetings;
  }

  async startScheduledMeetings(currentTime: Date): Promise<number> {
    const result = await this.model.updateMany(
      {
        status: 'accepted',
        scheduledAt: { $lte: currentTime },
      },
      {
        $set: { status: 'ongoing' },
      },
    );

    return result.modifiedCount;
  }

  async completeOngoingMeetings(currentTime: Date): Promise<number> {
    const ongoingMeetings = await this.model.find({
      status: 'ongoing',
    });

    let completedCount = 0;

    for (const meeting of ongoingMeetings) {
      const meetingEndTime = new Date(
        meeting.scheduledAt.getTime() + meeting.durationMinutes * 60 * 1000,
      );

      if (meetingEndTime <= currentTime) {
        await this.model.updateOne({ _id: meeting._id }, { $set: { status: 'completed' } });
        completedCount++;
      }
    }

    return completedCount;
  }

  async findById(id: string, session?: ClientSession): Promise<IMeeting | null> {
    return await super.findById(id, session);
  }

  async findUpcomingMeetingsByFreelancerId(contractIds: string[]): Promise<IMeeting[]> {
    return await this.model
      .find({
        contractId: { $in: contractIds },
        status: { $in: ['accepted', 'ongoing'] },
        scheduledAt: { $gte: new Date() },
      })
      .sort({ status: -1, scheduledAt: 1 })
      .populate('contractId', 'title')
      .lean();
  }

  async findPreContractMeetingsForClient(
    clientId: string,
    query: ClientMeetingQueryParamsDTO,
  ): Promise<IMeeting[]> {
    const filter: Record<string, unknown> = {
      clientId: new Types.ObjectId(clientId),
      meetingType: 'pre-contract',
    };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.requestedBy) {
      filter.requestedBy = query.requestedBy;
    }

    if (query.rescheduleRequestedBy) {
      filter.rescheduleRequestedBy = query.rescheduleRequestedBy;
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const meetings = await this.model
      .find(filter)
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return meetings;
  }

  async countPreContractMeetingsForClient(
    clientId: string,
    query: ClientMeetingQueryParamsDTO,
  ): Promise<number> {
    const filter: Record<string, unknown> = {
      clientId: new Types.ObjectId(clientId),
      meetingType: 'pre-contract',
    };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.requestedBy) {
      filter.requestedBy = query.requestedBy;
    }

    if (query.rescheduleRequestedBy) {
      filter.rescheduleRequestedBy = query.rescheduleRequestedBy;
    }

    return await this.model.countDocuments(filter);
  }

  async findPreContractMeetingsForFreelancer(
    freelancerId: string,
    query: FreelancerMeetingQueryParamsDTO,
  ): Promise<IMeeting[]> {
    const filter: Record<string, unknown> = {
      freelancerId: new Types.ObjectId(freelancerId),
      meetingType: 'pre-contract',
    };

    if (query.status) {
      filter.status = query.status;
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const meetings = await this.model
      .find(filter)
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return meetings;
  }

  async countPreContractMeetingsForFreelancer(
    freelancerId: string,
    query: FreelancerMeetingQueryParamsDTO,
  ): Promise<number> {
    const filter: Record<string, unknown> = {
      freelancerId: new Types.ObjectId(freelancerId),
      meetingType: 'pre-contract',
    };

    if (query.status) {
      filter.status = query.status;
    }

    return await this.model.countDocuments(filter);
  }

  async findMeetingsStartingSoon(startTime: Date, endTime: Date): Promise<IMeeting[]> {
    return await this.model
      .find({
        status: 'accepted',
        scheduledAt: { $gte: startTime, $lte: endTime },
      })
      .exec();
  }

  async findAcceptedMeetingsStartingAt(currentTime: Date): Promise<IMeeting[]> {
    return await this.model
      .find({
        status: 'accepted',
        scheduledAt: { $lte: currentTime },
      })
      .exec();
  }
}
