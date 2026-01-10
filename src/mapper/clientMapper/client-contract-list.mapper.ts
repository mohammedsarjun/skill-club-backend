import { IContract } from '../../models/interfaces/contract.model.interface';
import { ClientContractListItemDTO } from '../../dto/clientDTO/client-contract.dto';

export const mapContractModelToClientContractListItemDTO = (
  contract: IContract,
): ClientContractListItemDTO => {
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
  const freelancerPop = contract.freelancerId as unknown as Partial<{
    firstName?: string;
    lastName?: string;
    freelancerProfile?: { logo?: string };
    toString?: () => string;
  }>;

  const freelancer =
    typeof contract.freelancerId === 'object' && contract.freelancerId !== null
      ? {
          freelancerId: freelancerPop.toString?.() || '',
          firstName: freelancerPop.firstName,
          lastName: freelancerPop.lastName,
          logo: freelancerPop.freelancerProfile?.logo,
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
    freelancer,
  };
};
