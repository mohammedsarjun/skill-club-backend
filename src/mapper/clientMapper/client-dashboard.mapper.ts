import { IJob } from '../../models/interfaces/job.model.interface';
import { IMessage } from '../../models/message.model';
import { RecentJobDTO, RecentMessageDTO, ClientDashboardStatsDTO } from '../../dto/clientDTO/client-dashboard.dto';
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
  isUnread: boolean
): RecentMessageDTO => {
  const initials = senderName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
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
  pendingProposals: number
): ClientDashboardStatsDTO => {
  return {
    activeJobs,
    postedJobs,
    totalSpend,
    pendingProposals,
  };
};
