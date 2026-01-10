import { ProposalQueryParamsDTO } from '../../dto/clientDTO/client-proposal.dto';
import {
  IProposal,
  ProposalDetail,
  ProposalDetailWithFreelancerDetail,
  ProposalDetailWithJobDetail,
} from '../../models/interfaces/proposal.model.interface';
import BaseRepository from '../baseRepositories/base-repository';

export interface IProposalRepository extends BaseRepository<IProposal> {
  createProposal(proposalData: Partial<ProposalDetail>): Promise<IProposal | null>;
  findOneByFreelancerAndJobId(freelancerId: string, jobId: string): Promise<IProposal | null>;
  findAllByJobAndClientId(
    clientId: string,
    jobId: string,
    proposalFilterQuery: ProposalQueryParamsDTO,
    skip: number,
  ): Promise<ProposalDetailWithFreelancerDetail[] | null>;
  findAllByJobAndFreelancerId(
    freelancerId: string,
    jobId: string,
    proposalFilterQuery: ProposalQueryParamsDTO,
    skip: number,
  ): Promise<ProposalDetailWithJobDetail[] | null>;
  findOneById(proposalId: string): Promise<ProposalDetailWithFreelancerDetail | null>;
  updateStatusById(proposalId: string, status: string): Promise<IProposal | null>;
  findProposalByFreelancerAndJobId(freelancerId:string,proposalId:string): Promise<IProposal | null>
  countPendingProposalsByClientId(clientId: string): Promise<number>;
  countProposalsByJobId(jobId: string): Promise<number>;
}
