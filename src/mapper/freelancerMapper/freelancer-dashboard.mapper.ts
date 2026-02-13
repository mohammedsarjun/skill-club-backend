import {
  FreelancerContractStatsDto,
  FreelancerEarningsDto,
  FreelancerMeetingDto,
  FreelancerReviewDto,
  FreelancerReviewStatsDto,
} from '../../dto/freelancerDTO/freelancer-dashboard.dto';

export function mapToContractStatsDto(
  active: number,
  pending: number,
  completed: number,
): FreelancerContractStatsDto {
  return {
    active,
    pending,
    completed,
  };
}

export function mapToEarningsDto(
  total: number,
  available: number,
  commission: number,
  pending: number,
): FreelancerEarningsDto {
  return {
    total,
    available,
    commission,
    pending,
  };
}

interface PopulatedMeeting {
  _id: { toString(): string };
  contractId?: {
    clientId?: { firstName?: string; lastName?: string };
    title?: string;
  };
  scheduledAt: Date;
  status: string;
  agora?: { channelName?: string };
}

interface PopulatedReview {
  _id: { toString(): string };
  reviewerId?: { firstName?: string; lastName?: string };
  rating: number;
  comment?: string;
  contractId?: { title?: string };
  createdAt: Date;
}

export function mapToMeetingDto(meeting: PopulatedMeeting): FreelancerMeetingDto {
  const scheduledDate = new Date(meeting.scheduledAt);
  const timeString = scheduledDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    id: meeting._id.toString(),
    client:
      meeting.contractId?.clientId?.firstName && meeting.contractId?.clientId?.lastName
        ? `${meeting.contractId.clientId.firstName} ${meeting.contractId.clientId.lastName}`
        : 'Unknown Client',
    project: meeting.contractId?.title || 'Unknown Project',
    date: scheduledDate,
    time: timeString,
    status: meeting.status,
    channelName: meeting.agora?.channelName || '',
  };
}

export function mapToReviewDto(review: PopulatedReview): FreelancerReviewDto {
  return {
    id: review._id.toString(),
    client:
      review.reviewerId?.firstName && review.reviewerId?.lastName
        ? `${review.reviewerId.firstName} ${review.reviewerId.lastName}`
        : 'Anonymous',
    rating: review.rating,
    comment: review.comment || '',
    project: review.contractId?.title || 'Project',
    date: review.createdAt,
  };
}

export function mapToReviewStatsDto(
  average: number,
  total: number,
  recent: FreelancerReviewDto[],
): FreelancerReviewStatsDto {
  return {
    average,
    total,
    recent,
  };
}
