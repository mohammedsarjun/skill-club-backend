import { Types } from 'mongoose';
import { ExpertiseResponseDTO } from '../../dto/freelancerDTO/freelancer-expertise.dto';

export const mapExpertiseToResponseDTO = (data: {
  workCategory: Types.ObjectId;
  specialties: Types.ObjectId[];
  skills: Types.ObjectId[];
}): ExpertiseResponseDTO => {
  return {
    workCategory: data.workCategory.toString(),
    specialties: data.specialties.map((id) => id.toString()),
    skills: data.skills.map((id) => id.toString()),
  };
};
