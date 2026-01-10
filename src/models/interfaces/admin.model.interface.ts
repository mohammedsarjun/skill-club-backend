import { Document } from 'mongoose';

// 🧩 1. Interface for TypeScript type safety
export interface IAdmin extends Document {
  username: string;
  password: string;
  isSuperAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}
