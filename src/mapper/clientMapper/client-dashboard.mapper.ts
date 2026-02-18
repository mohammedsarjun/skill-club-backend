import { IJob } from '../../models/interfaces/job.model.interface';
import { IMessage } from '../../models/message.model';
import { IContract } from '../../models/interfaces/contract.model.interface';
import {
  RecentJobDTO,
  RecentMessageDTO,
  ClientDashboardStatsDTO,
  RecentActiveContractDTO,
  SavedFreelancerDTO,
} from '../../dto/clientDTO/client-dashboard.dto';
import { Types } from 'mongoose';

const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
  return `${Math.floor(seconds / 2592000)} months ago`;
};

export const mapJobToRecentJobDTO = (job: IJob, proposalsCount: number): RecentJobDTO => {
  let budget = '';
  const currencySymbol = '₹';

  if (job.rateType === 'hourly' && job.hourlyRate) {
    budget = `${currencySymbol}${job.hourlyRate.min} - ${currencySymbol}${job.hourlyRate.max}`;
  } else if (job.rateType === 'fixed' && job.fixedRate) {
    budget = `${currencySymbol}${job.fixedRate.min} - ${currencySymbol}${job.fixedRate.max}`;
  }

  return {
    _id: (job._id as Types.ObjectId).toString(),
    title: job.title,
    budget,
    proposals: proposalsCount,
    postedDate: formatTimeAgo(new Date(job.createdAt!)),
    status: job.status,
    rateType: job.rateType,
    currency: 'INR',
  };
};

export const mapMessageToRecentMessageDTO = (
  message: IMessage,
  senderName: string,
  isUnread: boolean,
): RecentMessageDTO => {
  const initials = senderName
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  return {
    _id: message.messageId,
    contractId: message.contractId,
    sender: {
      _id: message.senderId,
      name: senderName,
    },
    message: message.message,
    time: formatTimeAgo(new Date(message.sentAt)),
    unread: isUnread,
    avatar: initials,
  };
};

export const mapToDashboardStatsDTO = (
  activeJobs: number,
  postedJobs: number,
  totalSpend: number,
  pendingProposals: number,
): ClientDashboardStatsDTO => {
  return {
    activeJobs,
    postedJobs,
    totalSpend,
    pendingProposals,
  };
};

interface PopulatedFreelancer {
  _id?: { toString(): string };
  firstName?: string;
  lastName?: string;
  logo?: string;
  country?: string;
}

interface PopulatedJob {
  title?: string;
}

export const mapContractToRecentActiveContractDTO = (
  contract: IContract,
): RecentActiveContractDTO => {
  const freelancer = contract.freelancerId as unknown as PopulatedFreelancer;
  const job = contract.jobId as unknown as PopulatedJob;

  const freelancerName =
    freelancer?.firstName && freelancer?.lastName
      ? `${freelancer.firstName} ${freelancer.lastName}`
      : 'Unknown';

  return {
    _id: (contract._id as Types.ObjectId).toString(),
    title: job?.title || contract.title || 'Untitled Contract',
    freelancer: {
      _id: freelancer?._id?.toString() || '',
      name: freelancerName,
      logo: freelancer?.logo,
      country: freelancer?.country,
    },
    status: contract.status,
    contractType: contract.paymentType,
    startDate: contract.expectedStartDate
      ? new Date(contract.expectedStartDate).toLocaleDateString()
      : 'N/A',
    budget: contract.budget || 0,
    currency: contract.currency || 'INR',
  };
};

export const mapToSavedFreelancerDTO = (savedFreelancerData: {
  _id: string;
  savedAt: Date;
  freelancer: {
    _id: string;
    firstName?: string;
    lastName?: string;
    logo?: string;
    professionalRole?: string;
    country?: string;
    hourlyRate?: number;
    skills: string[];
  } | null;
}): SavedFreelancerDTO => {
  const freelancerName =
    savedFreelancerData.freelancer?.firstName && savedFreelancerData.freelancer?.lastName
      ? `${savedFreelancerData.freelancer.firstName} ${savedFreelancerData.freelancer.lastName}`
      : 'Unknown';

  return {
    _id: savedFreelancerData._id,
    freelancer: {
      _id: savedFreelancerData.freelancer?._id || '',
      name: freelancerName,
      logo: savedFreelancerData.freelancer?.logo,
      professionalRole: savedFreelancerData.freelancer?.professionalRole,
      country: savedFreelancerData.freelancer?.country,
      hourlyRate: savedFreelancerData.freelancer?.hourlyRate,
      skills: savedFreelancerData.freelancer?.skills || [],
    },
    savedAt: formatTimeAgo(new Date(savedFreelancerData.savedAt)),
  };
};
