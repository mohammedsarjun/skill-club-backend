// seedAdmin.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from '../models/admin.model'; // adjust path if needed
import { connectDB } from './db'; // adjust path based on your folder structure

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await connectDB();

    const existingSuperAdmin = await Admin.findOne({ isSuperAdmin: true });
    if (existingSuperAdmin) {
      return;
    }

    const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD as string, 10);

    await Admin.create({
      username: process.env.SUPER_ADMIN_USERNAME as string,
      password: hashedPassword,
      isSuperAdmin: true,
    });

    console.log('✅ Super admin created successfully!');
  } catch (error) {
    console.error('❌ Error seeding super admin:', (error as Error).message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed.');
  }
};

seedSuperAdmin();
