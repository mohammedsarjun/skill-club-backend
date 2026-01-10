export interface IFreelancerSavedJobService {
  toggleSaveJob(freelancerId: string, jobId: string): Promise<{ saved: boolean }>;
  isJobSaved(freelancerId: string, jobId: string): Promise<boolean>;
  getSavedJobIds(freelancerId: string): Promise<string[]>;
  getSavedJobs(
    freelancerId: string,
    query: { page?: number; limit?: number },
  ): Promise<
    import('../../../dto/freelancerDTO/freelancer-saved-job.dto').FreelancerSavedJobListResultDTO
  >;
}

export default IFreelancerSavedJobService;
