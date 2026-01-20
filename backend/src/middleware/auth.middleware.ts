import { Request, Response, NextFunction } from 'express';
import authService from '@/services/auth.service';
import User from '@/models/User.model';
import { AppError } from '@/utils/AppError';

export const protect = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Check if authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extract token from header
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Not authorized, no token', 401);
    }

    // Verify token
    const decoded = authService.verifyToken(token);

    // Get user from the token (don't select the password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Attach user to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    };

    next();
  } catch (error) {
    next(error);
  }
};
