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

export function mapToMeetingDto(meeting: any): FreelancerMeetingDto {
  const scheduledDate = new Date(meeting.scheduledAt);
  const timeString = scheduledDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    id: meeting._id.toString(),
    client: meeting.contractId?.clientId?.firstName && meeting.contractId?.clientId?.lastName
      ? `${meeting.contractId.clientId.firstName} ${meeting.contractId.clientId.lastName}`
      : 'Unknown Client',
    project: meeting.contractId?.title || 'Unknown Project',
    date: scheduledDate,
    time: timeString,
    status: meeting.status,
    channelName: meeting.agora?.channelName || '',
  };
}

export function mapToReviewDto(review: any): FreelancerReviewDto {
  return {
    id: review._id.toString(),
    client: review.reviewerId?.firstName && review.reviewerId?.lastName
      ? `${review.reviewerId.firstName} ${review.reviewerId.lastName}`
      : 'Anonymous',
    rating: review.rating,
    comment: review.comment,
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
