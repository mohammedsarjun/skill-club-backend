import { SavedJobWithJobAggregation } from '../../repositories/interfaces/saved-job-repository.interface';
import { FreelancerSavedJobListItemDTO } from '../../dto/freelancerDTO/freelancer-saved-job.dto';

export function mapSavedJobAggToListItemDTO(
  doc: SavedJobWithJobAggregation,
): FreelancerSavedJobListItemDTO {
  const job = doc.job;
  const categoryName = job?.category ? job.category.name : null;
  return {
    id: doc._id,
    jobId: job?._id ?? '',
    title: job?.title ?? '',
    description: job?.description ?? '',
    category: categoryName,
    specialities: (job?.specialities ?? []).map((s) => s.name),
    skills: (job?.skills ?? []).map((k) => k.name),
    rateType: job?.rateType ?? 'fixed',
    hourlyRate: job && job.rateType === 'hourly' ? (job.hourlyRate ?? null) : null,
    fixedRate: job && job.rateType === 'fixed' ? (job.fixedRate ?? null) : null,
    client: {
      companyName: job?.client?.companyName,
      country: job?.client?.country,
      rating: 0,
    },
    status: job?.status ?? '',
    postedAt: job?.createdAt ? new Date(job.createdAt).toISOString() : new Date(0).toISOString(),
    savedAt: new Date(doc.savedAt).toISOString(),
  };
}
