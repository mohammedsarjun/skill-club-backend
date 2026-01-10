import { proposalModel } from '../models/proposal.model';
import BaseRepository from './baseRepositories/base-repository';
import {
  IProposal,
  ProposalDetail,
  ProposalDetailWithFreelancerDetail,
  ProposalDetailWithJobDetail,
} from '../models/interfaces/proposal.model.interface';
import { IProposalRepository } from './interfaces/proposal-repository.interface';
import { ProposalQueryParamsDTO } from '../dto/clientDTO/client-proposal.dto';

export class ProposalRepository extends BaseRepository<IProposal> implements IProposalRepository {
  constructor() {
    super(proposalModel);
  }

  async createProposal(proposalData: Partial<ProposalDetail>): Promise<IProposal | null> {
    return await super.create(proposalData);
  }

  async findOneByFreelancerAndJobId(
    freelancerId: string,
    jobId: string,
  ): Promise<IProposal | null> {
    return await super.findOne({ freelancerId, jobId });
  }

  async findAllByJobAndClientId(
    _clientId: string,
    jobId: string,
    proposalFilterQuery: ProposalQueryParamsDTO,
    skip: number,
  ): Promise<ProposalDetailWithFreelancerDetail[] | null> {
    console.log(jobId, proposalFilterQuery);
    const status: ProposalQueryParamsDTO['status'] | undefined = proposalFilterQuery?.status;
    const query: Partial<{
      jobId: string;
      freelancerId: string;
      status: ProposalQueryParamsDTO['status'];
    }> = { jobId: jobId };
    if (status) query.status = status;

    const proposals = await super.findAll(query, {
      skip,
      limit: proposalFilterQuery.limit,
      populate: {
        path: 'freelancerId',
        select: '_id firstName lastName freelancerProfile.logo address.country',
      },
    });

    // Rename freelancerId → freelancer
    const formattedProposals = proposals?.map((proposal) => ({
      ...proposal.toObject(),
      freelancer: proposal.freelancerId,
    }));

    return formattedProposals || null;
  }

  async findAllByJobAndFreelancerId(
    freelancerId: string,
    jobId: string,
    proposalFilterQuery: ProposalQueryParamsDTO,
    skip: number,
  ): Promise<ProposalDetailWithJobDetail[] | null> {
    console.log(jobId);
    const status: ProposalQueryParamsDTO['status'] | undefined = proposalFilterQuery?.status;
    const query: Partial<{
      jobId: string;
      freelancerId: string;
      status: ProposalQueryParamsDTO['status'];
    }> = { freelancerId: freelancerId };
    if (status) query.status = status;

    const proposals = await super.findAll(query, {
      skip,
      limit: proposalFilterQuery.limit,
      populate: {
        path: 'jobId',
        select: '_id title description clientId',
      },
    });

    // Rename freelancerId → freelancer
    const formattedProposals = proposals?.map((proposal) => ({
      ...proposal.toObject(),
      freelancer: proposal.freelancerId,
      jobDetail: proposal.jobId,
    }));

    return formattedProposals || null;
  }

  async findOneById(proposalId: string): Promise<ProposalDetailWithFreelancerDetail | null> {
    const proposal = await super.findOne(
      { _id: proposalId },
      {
        populate: {
          path: 'freelancerId',
          select: '_id firstName lastName freelancerProfile.logo address.country',
        },
      },
    );

    if (!proposal) return null;

    const formattedProposal = {
      ...proposal.toObject(),
      freelancer: proposal.freelancerId,
    };

    return formattedProposal;
  }

  async updateStatusById(proposalId: string, status: string): Promise<IProposal | null> {
    return await super.updateById(proposalId, { $set: { status } });
  }

  async findProposalByFreelancerAndJobId(freelancerId:string,jobId:string): Promise<IProposal | null>{
    return await super.findOne({freelancerId,jobId})
  }

  async countPendingProposalsByClientId(clientId: string): Promise<number> {
    const jobIds = await this.model.distinct('jobId', {}).exec();
    const jobs = await this.model.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      { $match: { 'job.clientId': clientId, status: 'pending_verification' } }
    ]).exec();
    return jobs.length;
  }

  async countProposalsByJobId(jobId: string): Promise<number> {
    return await super.count({ jobId });
  }
}
