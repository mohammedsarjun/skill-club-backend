import { ClientSavedFreelancerListItemDTO } from '../../dto/clientDTO/client-saved-freelancer.dto';

export function mapSavedFreelancerAggToDTO(doc: {
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
}): ClientSavedFreelancerListItemDTO {
  return {
    id: doc._id,
    freelancerId: doc.freelancer?._id ?? '',
    firstName: doc.freelancer?.firstName,
    lastName: doc.freelancer?.lastName,
    logo: doc.freelancer?.logo,
    professionalRole: doc.freelancer?.professionalRole,
    country: doc.freelancer?.country,
    hourlyRate: doc.freelancer?.hourlyRate,
    skills: doc.freelancer?.skills ?? [],
    savedAt: new Date(doc.savedAt).toISOString(),
  };
}
