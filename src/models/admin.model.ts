// models/Admin.ts
import mongoose, { Schema } from 'mongoose';
import { IAdmin } from './interfaces/admin.model.interface';

// 🧩 2. Mongoose Schema definition
const AdminSchema: Schema<IAdmin> = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }, // automatically adds createdAt, updatedAt
);

// 🧩 3. Model export
const Admin = mongoose.model<IAdmin>('admin', AdminSchema);
export default Admin;
