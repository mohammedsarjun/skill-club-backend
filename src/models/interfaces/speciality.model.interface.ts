import { Document } from 'mongoose';
import { Types } from 'mongoose';
import { ISkill } from './skill.model.interface';
export interface ISpeciality extends Document {
  _id: string;
  name: string;
  category: Types.ObjectId;
  status: string;
}

export interface ISpecialityWithSkill {
  _id: string;
  name: string;
  skills: ISkill[];
}
