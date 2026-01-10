export interface IClientSavedFreelancerService {
  toggleSaveFreelancer(clientId: string, freelancerId: string): Promise<{ saved: boolean }>;
  isFreelancerSaved(clientId: string, freelancerId: string): Promise<boolean>;
  getSavedFreelancers(
    clientId: string,
    query: { page?: number; limit?: number },
  ): Promise<
    import('../../../dto/clientDTO/client-saved-freelancer.dto').ClientSavedFreelancerListResultDTO
  >;
}

export default IClientSavedFreelancerService;
