import { Document } from 'mongoose';
import { Types } from 'mongoose';
export interface ISkill extends Document {
  _id: Types.ObjectId;
  name: string;
  specialities: Types.ObjectId[];
  status: string;
}
