import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import serverConfig from '@src/config/server.config';
import UserModel from '@src/db/models/user.model';
import { UserRole } from '@src/interfaces/enum.interface';

export const seedDB = async () => {
  try {
    await mongoose.connect(serverConfig.DB_URI);

    await UserModel.deleteMany({});
    const salt = await bcrypt.genSalt(serverConfig.BCRYPT_SALT_ROUNDS);

    const users = [
      {
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: await bcrypt.hash('adminpassword', salt),
        role: UserRole.admin,
      },
      {
        fullName: 'Customer User',
        email: 'customer@example.com',
        password: await bcrypt.hash('customerpassword', salt),
        role: UserRole.customer,
      },
    ];

    await UserModel.insertMany(users);

    console.log('Users seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};
