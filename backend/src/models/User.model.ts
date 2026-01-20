import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

// User interface for TypeScript
export interface IUser {
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  bio?: string;
  oauthProvider?: 'local' | 'google';
}

// User Document interface (includes Mongoose document methods)
export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    password: { 
      type: String, 
      required: function(this: any) { return this.oauthProvider === 'local'; } 
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    oauthProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    }
  },
  {
    timestamps: true
  }
);

// Hash the password before saving the user to the database
userSchema.pre('save', async function (next) {
  if (this.oauthProvider === 'google') {
    return next();
  }
  
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

const User = mongoose.model<IUserDocument>('User', userSchema);

export default User;
