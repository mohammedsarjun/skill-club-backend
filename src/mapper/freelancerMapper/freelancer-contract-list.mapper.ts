import { IContract } from '../../models/interfaces/contract.model.interface';
import { FreelancerContractListItemDTO } from '../../dto/freelancerDTO/freelancer-contract.dto';

export const mapContractModelToFreelancerContractListItemDTO = (
  contract: IContract,
): FreelancerContractListItemDTO => {
  function docIdToString(id: unknown): string {
    if (!id) return '';
    if (typeof id === 'string') return id;
    if (
      typeof id === 'object' &&
      id !== null &&
      'toString' in id &&
      typeof (id as { toString: unknown }).toString === 'function'
    ) {
      return (id as { toString(): string }).toString();
    }
    return '';
  }
  const clientPop = contract.clientId as unknown as Partial<{
    firstName?: string;
    lastName?: string;
    companyName?: string;
    logo?: string;
    toString?: () => string;
  }>;

  const client =
    typeof contract.clientId === 'object' && contract.clientId !== null
      ? {
          clientId: clientPop.toString?.() || '',
          firstName: clientPop.firstName,
          lastName: clientPop.lastName,
          companyName: clientPop.companyName,
          logo: clientPop.logo,
        }
      : undefined;

  const rawId = (contract as unknown as Record<string, unknown>).id as unknown;
  const objectId = (contract as unknown as Record<string, unknown>)._id as unknown;

  return {
    id: (typeof rawId === 'string' && rawId) || docIdToString(objectId) || contract.contractId,
    contractId: contract.contractId,
    title: contract.title,
    paymentType: contract.paymentType,
    budget: contract.budget,
    hourlyRate: contract.hourlyRate,
    status: contract.status,
    createdAt: contract.createdAt!,
    client,
  };
};
