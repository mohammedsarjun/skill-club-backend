import { Document } from 'mongoose';
import { Types } from 'mongoose';
export interface ISkill extends Document {
  _id: string;
  name: string;
  specialities: Types.ObjectId[];
  status: string;
}
