import BaseRepository from './baseRepositories/base-repository';
import { IContract, ContractStatus } from '../models/interfaces/contract.model.interface';
import { Contract } from '../models/contract.model';
import { IContractRepository } from './interfaces/contract-repository.interface';
import { ClientContractQueryParamsDTO } from '../dto/clientDTO/client-contract.dto';
import { FreelancerContractQueryParamsDTO } from '../dto/freelancerDTO/freelancer-contract.dto';
import { AdminContractQueryParamsDTO } from '../dto/adminDTO/admin-contract.dto';
import { UpdateQuery, ClientSession } from 'mongoose';
import { DeliverableChangeQueryStrategyFactory } from './factories/interfaces/deliverable-change.strategy.interface';
import { inject, injectable } from 'tsyringe';

@injectable()
export class ContractRepository extends BaseRepository<IContract> implements IContractRepository {
  private _deliverableChangeStrategyFactory: DeliverableChangeQueryStrategyFactory;
  constructor(
    @inject('DeliverableChangeQueryStrategyFactory')
    deliverableChangeStrategyFactory: DeliverableChangeQueryStrategyFactory,
  ) {
    super(Contract);
    this._deliverableChangeStrategyFactory = deliverableChangeStrategyFactory;
  }

  async createContract(data: Partial<IContract>, session?: ClientSession): Promise<IContract> {
    return await super.create(data, session);
  }

  async findByOfferId(offerId: string): Promise<IContract | null> {
    return await super.findOne({ offerId });
  }

  async findContractDetailByIdForClient(
    contractId: string,
    clientId: string,
  ): Promise<IContract | null> {
    return await this.findOne(
      { _id: contractId, clientId },
      {
        populate: [
          { path: 'clientId', select: 'firstName lastName logo companyName country' },
          { path: 'freelancerId', select: 'firstName lastName logo country rating' },
          { path: 'jobId', select: 'title' },
          { path: 'offerId', select: 'offerType' },
          // Populate the user who submitted each deliverable so frontend can display submitter info
          { path: 'deliverables.submittedBy', select: 'firstName lastName avatar' },
        ],
      },
    );
  }

  async updateStatusById(
    contractId: string,
    status: IContract['status'],
    session?: ClientSession,
  ): Promise<IContract | null> {
    return await this.updateById(contractId, { status }, session);
  }

  async cancelContractByUser(
    contractId: string,
    cancelledBy: 'client' | 'freelancer',
    cancelContractReason: string,
    session?: ClientSession,
  ): Promise<IContract | null> {
    return await this.updateById(
      contractId,
      {
        status: 'cancelled',
        cancelledBy,
        cancellingReason: cancelContractReason,
        cancelledAt: new Date(),
      },
      session,
    );
  }

  async findAllForClient(
    clientId: string,
    query: ClientContractQueryParamsDTO,
  ): Promise<IContract[]> {
    const { search, filters } = query;
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { clientId };
    if (filters?.status) filter.status = filters.status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    return await super.findAll(filter, {
      skip,
      limit,
      populate: { path: 'freelancerId', select: '_id firstName lastName freelancerProfile.logo' },
    });
  }

  async countForClient(clientId: string, query: ClientContractQueryParamsDTO): Promise<number> {
    const { search, filters } = query;
    const filter: Record<string, unknown> = { clientId };
    if (filters?.status) filter.status = filters.status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    return await super.count(filter);
  }

  async findAllForFreelancer(
    freelancerId: string,
    query: FreelancerContractQueryParamsDTO,
  ): Promise<IContract[]> {
    const { search, filters } = query;
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { freelancerId };
    if (filters?.status) filter.status = filters.status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    return await super.findAll(filter, {
      skip,
      limit,
      populate: { path: 'clientId', select: '_id firstName lastName companyName logo' },
    });
  }

  async countForFreelancer(
    freelancerId: string,
    query: FreelancerContractQueryParamsDTO,
  ): Promise<number> {
    const { search, filters } = query;
    const filter: Record<string, unknown> = { freelancerId };
    if (filters?.status) filter.status = filters.status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    return await super.count(filter);
  }

  async findAllForAdmin(query: AdminContractQueryParamsDTO): Promise<IContract[]> {
    const { search, filters } = query;
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (filters?.status) filter.status = filters.status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { contractId: { $regex: search, $options: 'i' } },
      ];
    }

    return await super.findAll(filter, {
      skip,
      limit,
      populate: [
        { path: 'clientId', select: '_id firstName lastName companyName logo' },
        { path: 'freelancerId', select: '_id firstName lastName freelancerProfile.logo' },
      ],
    });
  }

  async countForAdmin(query: AdminContractQueryParamsDTO): Promise<number> {
    const { search, filters } = query;
    const filter: Record<string, unknown> = {};
    if (filters?.status) filter.status = filters.status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { contractId: { $regex: search, $options: 'i' } },
      ];
    }
    return await super.count(filter);
  }

  async findDetailByIdForAdmin(contractId: string): Promise<IContract | null> {
    return await this.findOne(
      { _id: contractId },
      {
        populate: [
          { path: 'clientId', select: 'firstName lastName logo companyName country' },
          { path: 'freelancerId', select: 'firstName lastName logo country rating' },
          { path: 'jobId', select: 'title' },
          { path: 'offerId', select: 'offerType' },
        ],
      },
    );
  }

  async findDetailByIdForFreelancer(
    contractId: string,
    freelancerId: string,
  ): Promise<IContract | null> {
    return await this.findOne(
      { _id: contractId, freelancerId },
      {
        populate: [
          { path: 'clientId', select: 'firstName lastName logo companyName country' },
          { path: 'jobId', select: 'title' },
          { path: 'offerId', select: 'offerType' },
          { path: 'deliverables.submittedBy', select: 'firstName lastName avatar' },
        ],
      },
    );
  }

  async submitDeliverable(
    contractId: string,
    submittedBy: string,
    files: { fileName: string; fileUrl: string }[],
    message: string | undefined,
  ): Promise<IContract | null> {
    const contract = await this.findById(contractId);
    if (!contract) return null;

    const version = (contract.deliverables?.length || 0) + 1;

    return await this.updateById(contractId, {
      $push: {
        deliverables: {
          submittedBy,
          files,
          message,
          status: 'submitted',
          version,
          submittedAt: new Date(),
        },
      },
    } as UpdateQuery<IContract>);
  }

  async approveDeliverable(
    contractId: string,
    deliverableId: string,
    message?: string,
  ): Promise<IContract | null> {
    const updateFields: Record<string, unknown> = {
      'deliverables.$[elem].status': 'approved',
      'deliverables.$[elem].approvedAt': new Date(),
    };

    if (message) {
      updateFields['deliverables.$[elem].message'] = message;
    }

    return (await this.model
      .findByIdAndUpdate(
        contractId,
        { $set: updateFields },
        {
          new: true,
          arrayFilters: [{ 'elem._id': deliverableId }],
        },
      )
      .exec()) as IContract | null;
  }

  async requestDeliverableChanges(
    contractId: string,
    deliverableId: string,
    message: string,
    milestoneId: string | undefined,
    contractType: string,
  ): Promise<IContract | null> {
    const strategy = this._deliverableChangeStrategyFactory.getStrategy(contractType);

    const { filter, update, options } = strategy.buildQuery({
      contractId,
      deliverableId,
      message,
      milestoneId,
    });
    return (await this.model.findByIdAndUpdate(filter, update, options).exec()) as IContract | null;
  }

  async updateContractPayment(
    contractId: string,
    totalPaid: number,
    balance: number,
  ): Promise<IContract | null> {
    return await this.updateById(contractId, { totalPaid, balance });
  }

  async markContractAsCompleted(contractId: string): Promise<IContract | null> {
    return await this.updateById(contractId, { status: 'completed' });
  }

  async submitMilestoneDeliverable(
    contractId: string,
    milestoneId: string,
    submittedBy: string,
    files: { fileName: string; fileUrl: string }[],
    message: string | undefined,
  ): Promise<IContract | null> {
    const contract = await this.findById(contractId);
    if (!contract) return null;

    const milestone = contract.milestones?.find((m) => m._id?.toString() === milestoneId);
    if (!milestone) return null;

    const version = (milestone.deliverables?.length || 0) + 1;

    return (await this.model
      .findByIdAndUpdate(
        contractId,
        {
          $push: {
            'milestones.$[milestone].deliverables': {
              submittedBy,
              files,
              message,
              status: 'submitted',
              version,
              submittedAt: new Date(),
            },
          },
        },
        {
          new: true,
          arrayFilters: [{ 'milestone._id': milestoneId }],
        },
      )
      .exec()) as IContract | null;
  }

  async approveMilestoneDeliverable(
    contractId: string,
    milestoneId: string,
    deliverableId: string,
    message?: string,
  ): Promise<IContract | null> {
    const updateFields: Record<string, unknown> = {
      'milestones.$[milestone].deliverables.$[deliverable].status': 'approved',
      'milestones.$[milestone].deliverables.$[deliverable].approvedAt': new Date(),
    };

    if (message) {
      updateFields['milestones.$[milestone].deliverables.$[deliverable].message'] = message;
    }

    return (await this.model
      .findByIdAndUpdate(
        contractId,
        { $set: updateFields },
        {
          new: true,
          arrayFilters: [{ 'milestone._id': milestoneId }, { 'deliverable._id': deliverableId }],
        },
      )
      .exec()) as IContract | null;
  }

  async requestMilestoneChanges(
    contractId: string,
    milestoneId: string,
    deliverableId: string,
    message: string,
  ): Promise<IContract | null> {
    return (await this.model
      .findByIdAndUpdate(
        contractId,
        {
          $set: {
            'milestones.$[milestone].deliverables.$[deliverable].status': 'changes_requested',
            'milestones.$[milestone].deliverables.$[deliverable].message': message,
            'milestones.$[milestone].status': 'changes_requested',
          },
          $inc: {
            'milestones.$[milestone].deliverables.$[deliverable].revisionsRequested': 1,
          },
        },
        {
          new: true,
          arrayFilters: [{ 'milestone._id': milestoneId }, { 'deliverable._id': deliverableId }],
        },
      )
      .exec()) as IContract | null;
  }

  async requestMilestoneExtension(
    contractId: string,
    milestoneId: string,
    requestedBy: string,
    requestedDeadline: Date,
    reason: string,
  ): Promise<IContract | null> {
    return (await this.model
      .findByIdAndUpdate(
        contractId,
        {
          $set: {
            'milestones.$[milestone].extensionRequest': {
              requestedBy,
              requestedDeadline,
              reason,
              status: 'pending',
              requestedAt: new Date(),
            },
          },
        },
        {
          new: true,
          arrayFilters: [{ 'milestone._id': milestoneId }],
        },
      )
      .exec()) as IContract | null;
  }

  async respondToMilestoneExtension(
    contractId: string,
    milestoneId: string,
    approved: boolean,
    responseMessage?: string,
  ): Promise<IContract | null> {
    const updateFields: Record<string, unknown> = {
      'milestones.$[milestone].extensionRequest.status': approved ? 'approved' : 'rejected',
      'milestones.$[milestone].extensionRequest.respondedAt': new Date(),
    };

    if (responseMessage) {
      updateFields['milestones.$[milestone].extensionRequest.responseMessage'] = responseMessage;
    }

    const contract = (await this.model
      .findByIdAndUpdate(
        contractId,
        { $set: updateFields },
        {
          new: true,
          arrayFilters: [{ 'milestone._id': milestoneId }],
        },
      )
      .exec()) as IContract | null;

    if (approved && contract) {
      const milestone = contract.milestones?.find((m) => m._id?.toString() === milestoneId);
      if (milestone?.extensionRequest?.requestedDeadline) {
        return (await this.model
          .findByIdAndUpdate(
            contractId,
            {
              $set: {
                'milestones.$[milestone].expectedDelivery':
                  milestone.extensionRequest.requestedDeadline,
              },
            },
            {
              new: true,
              arrayFilters: [{ 'milestone._id': milestoneId }],
            },
          )
          .exec()) as IContract | null;
      }
    }

    return contract;
  }

  async updateMilestoneStatus(
    contractId: string,
    milestoneId: string,
    status: string,
    session?: ClientSession,
  ): Promise<IContract | null> {
    const query = this.model.findByIdAndUpdate(
      contractId,
      {
        $set: {
          'milestones.$[milestone].status': status,
        },
      },
      {
        new: true,
        arrayFilters: [{ 'milestone._id': milestoneId }],
      },
    );

    if (session) {
      query.session(session);
    }

    return (await query.exec()) as IContract | null;
  }

  async addTimelineEntry(
    contractId: string,
    action: string,
    performedBy: string,
    milestoneId?: string,
    details?: string,
  ): Promise<IContract | null> {
    return await this.updateById(contractId, {
      $push: {
        timeline: {
          action,
          performedBy,
          milestoneId,
          details,
          timestamp: new Date(),
        },
      },
    } as UpdateQuery<IContract>);
  }

  async requestContractExtension(
    contractId: string,
    requestedBy: string,
    requestedDeadline: Date,
    reason: string,
  ): Promise<IContract | null> {
    return await this.updateById(contractId, {
      extensionRequest: {
        requestedBy,
        requestedDeadline,
        reason,
        status: 'pending',
        requestedAt: new Date(),
      },
    } as UpdateQuery<IContract>);
  }

  async respondToContractExtension(
    contractId: string,
    approved: boolean,
    responseMessage?: string,
  ): Promise<IContract | null> {
    const updateData: UpdateQuery<IContract> = {
      'extensionRequest.status': approved ? 'approved' : 'rejected',
      'extensionRequest.respondedAt': new Date(),
      'extensionRequest.responseMessage': responseMessage,
    };

    if (approved) {
      const contract = await this.findById(contractId);
      if (contract?.extensionRequest?.requestedDeadline) {
        updateData.expectedEndDate = contract.extensionRequest.requestedDeadline;
      }
    }

    return await this.updateById(contractId, updateData);
  }

  async findContractsWithPendingDeliverables(threeDaysAgo: Date): Promise<IContract[]> {
    const filter = {
      $or: [
        {
          deliverables: {
            $elemMatch: { status: 'submitted', submittedAt: { $lte: threeDaysAgo } },
          },
        },
        {
          'milestones.deliverables': {
            $elemMatch: { status: 'submitted', submittedAt: { $lte: threeDaysAgo } },
          },
        },
      ],
    } as Record<string, unknown>;

    return await super.findAll(filter, {
      populate: [
        { path: 'deliverables.submittedBy', select: 'firstName lastName avatar' },
        { path: 'milestones.deliverables.submittedBy', select: 'firstName lastName avatar' },
      ],
    });
  }

  async updateById<R = IContract>(
    id: string,
    data: UpdateQuery<IContract>,
    session?: ClientSession,
  ): Promise<R | null> {
    return await super.updateById<R>(id, data, session);
  }

  async isAllMilestonesPaid(contractId: string): Promise<boolean> {
    const contract = await this.findById(contractId);
    if (!contract || !contract.milestones) return false;
    return contract.milestones.every((milestone) => milestone.status === 'paid');
  }

  async activateHourlyContract(
    contractId: string,
    session?: ClientSession,
  ): Promise<IContract | null> {
    return await this.updateById(contractId, { status: 'active' }, session);
  }

  async getTotalSpendByClientId(clientId: string): Promise<number> {
    const result = await this.model.aggregate([
      { $match: { clientId: clientId } },
      { $group: { _id: null, total: { $sum: '$totalPaid' } } },
    ]);
    return result.length > 0 ? result[0].total : 0;
  }

  async getContractIdsByClientId(clientId: string): Promise<string[]> {
    const contracts = await this.model.find({ clientId }).select('_id').lean();

    return contracts.map((contract) => contract._id.toString());
  }

  async hasPendingDeliverables(contractId: string): Promise<boolean> {
    const contract = await super.findById(contractId);
    if (!contract || !contract.deliverables || contract.deliverables.length === 0) {
      return false;
    }
    return contract.deliverables.some((d) => d.status === 'submitted');
  }

  async hasAnyDeliverables(contractId: string): Promise<boolean> {
    const contract = await super.findById(contractId);
    return !!(contract && contract.deliverables && contract.deliverables.length > 0);
  }

  async markContractCancellationPending(
    contractId: string,
    session?: ClientSession,
  ): Promise<IContract | null> {
    return await this.updateById(contractId, { status: 'refunded' as ContractStatus }, session);
  }

  async getRecentContracts(limit: number): Promise<IContract[]> {
    return (await this.model
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('clientId', 'firstName lastName clientProfile.companyName')
      .populate('freelancerId', 'firstName lastName')
      .lean()) as unknown as IContract[];
  }

  async getRecentActiveContractsByClientId(clientId: string, limit: number): Promise<IContract[]> {
    return (await this.model
      .find({
        clientId,
        status: { $in: ['active', 'held'] as ContractStatus[] },
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('freelancerId', 'firstName lastName logo country')
      .populate('jobId', 'title')
      .lean()) as unknown as IContract[];
  }

  async countByFreelancerAndStatus(
    freelancerId: string,
    status: IContract['status'] | IContract['status'][],
  ): Promise<number> {
    const statusArray = Array.isArray(status) ? status : [status];
    return await this.model.countDocuments({
      freelancerId,
      status: { $in: statusArray },
    });
  }

  async approveDeliverableChangeRequest(
    contractId: string,
    deliverableId: string,
  ): Promise<IContract | null> {
    return (await this.model.findByIdAndUpdate(
      contractId,
      {
        $set: {
          'deliverables.$[elem].status': 'change_request_approved',
        },
      },
      {
        new: true,
        arrayFilters: [{ 'elem._id': deliverableId }],
      },
    )) as IContract | null;
  }

  async updateMilestoneFundedAmount(
    contractId: string,
    milestoneId: string,
    session?: ClientSession,
  ): Promise<IContract | null> {
    const query = this.model.findByIdAndUpdate(
      contractId,
      { $set: { 'milestones.$[milestone].isFunded': true } },
      {
        new: true,
        arrayFilters: [{ 'milestone._id': milestoneId }],
      },
    );

    if (session) {
      query.session(session);
    }

    return (await query.exec()) as IContract | null;
  }

  async markAllMilestonesAsCancelled(
    contractId: string,
    session?: ClientSession,
  ): Promise<IContract | null> {
    const query = this.model.findByIdAndUpdate(
      contractId,
      { $set: { 'milestones.$[].status': 'cancelled' } },
      { new: true },
    );

    if (session) {
      query.session(session);
    }

    return (await query.exec()) as IContract | null;
  }

  async markMilestoneAsCancelled(
    contractId: string,
    milestoneId: string,
    session?: ClientSession,
  ): Promise<IContract | null> {
    const query = this.model.findByIdAndUpdate(
      contractId,
      { $set: { 'milestones.$[milestone].status': 'cancelled' } },
      {
        new: true,
        arrayFilters: [{ 'milestone._id': milestoneId }],
      },
    );
    if (session) {
      query.session(session);
    }
    return (await query.exec()) as IContract | null;
  }

  async markMilestoneAsDisputeEligible(
    contractId: string,
    milestoneId: string,
    disputeWindowEndsAt: Date,
    session?: ClientSession,
  ): Promise<IContract | null> {
    const query = this.model.findByIdAndUpdate(
      contractId,
      {
        $set: {
          'milestones.$[milestone].disputeEligible': true,
          'milestones.$[milestone].disputeWindowEndsAt': disputeWindowEndsAt,
        },
      },
      {
        new: true,
        arrayFilters: [{ 'milestone._id': milestoneId }],
      },
    );
    if (session) {
      query.session(session);
    }
    return (await query.exec()) as IContract | null;
  }
  async endHourlyContract(contractId: string, session?: ClientSession): Promise<IContract | null> {
    return await this.updateById(contractId, { status: 'completed' }, session);
  }

}
