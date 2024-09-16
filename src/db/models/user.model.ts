import mongoose, { CallbackError, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import serverConfig from '@src/config/server.config';
import { UserRole } from '@src/interfaces/enum.interface';
import { DocumentWithTimestamps } from '@src/interfaces/core.interface';

export interface User extends DocumentWithTimestamps {
  fullName: string;
  email: string;
  password: string;
  isActive: boolean;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  profileImage?: string;
  role: UserRole;
}

const userSchema = new Schema<User, UserModel>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    isActive: { type: Boolean, default: true },
    phoneNumber: { type: String },
    lastLogin: { type: Date },
    profileImage: { type: String },
    role: { type: String, enum: UserRole, default: UserRole.customer },
  },
  { timestamps: true, discriminatorKey: 'role' }
);

userSchema.pre<User>('save', async function (next) {
  try {
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(serverConfig.BCRYPT_SALT_ROUNDS);
      this.password = await bcrypt.hash(this.password, salt);
    }

    next();
  } catch (error) {
    return next(error as CallbackError);
  }
});

userSchema.set('toJSON', {
  /**
   * Transforms the user document to hide the password before it is converted to json
   * @param doc - The user document
   * @param ret - The transformed user document
   */
  transform: (doc, ret) => {
    delete ret.password;
  },
});

interface UserModel extends Model<User> {}
const UserModel = mongoose.model<User, UserModel>('User', userSchema);
export default UserModel;
