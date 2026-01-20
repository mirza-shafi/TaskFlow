import User, { IUserDocument } from '@/models/User.model';

export const getUserById = async (id: string): Promise<IUserDocument | null> => {
  return User.findById(id).select('-password');
};

export const updateProfile = async (
  id: string, 
  updateData: { name?: string; bio?: string; avatarUrl?: string }
): Promise<IUserDocument | null> => {
  return User.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-password');
};

export const findByEmail = async (email: string): Promise<IUserDocument | null> => {
  return User.findOne({ email });
};
