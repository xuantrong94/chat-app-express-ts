import mongoose from 'mongoose';
import { IUser } from '../shared/types/user.types.js';
import bcrypt from 'bcrypt';

export interface IUserDocument extends IUser, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>; // Instance method to compare passwords
}

export interface IUserModel extends mongoose.Model<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
}

const userSchema = new mongoose.Schema<IUserDocument, IUserModel>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model<IUserDocument>('User', userSchema);

// ================================================ //
// =============== STATIC METHODS ================= //
// ================================================ //

userSchema.statics.findByEmail = async function (email: string): Promise<IUserDocument | null> {
  return this.findOne({ email });
};

// ================================================ //
// =============== INSTANCE METHODS =============== //
// ================================================ //

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// ================================================ //
// =============== MIDDLEWARES ==================== //
// ================================================ //

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

export default User;
