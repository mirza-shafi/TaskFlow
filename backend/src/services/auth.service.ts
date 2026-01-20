import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, { IUserDocument } from '@/models/User.model';
import { LoginDto, RegisterDto, AuthResponseDto } from '@/dto/auth.dto';
import { AppError } from '@/utils/AppError';
import { config } from '@/config/environment';

export class AuthService {
  // Register a new user
  async registerUser(data: RegisterDto): Promise<AuthResponseDto> {
    const { name, email, password } = data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User already exists with this email', 400);
    }

    // Create new user (password will be hashed by pre-save hook)
    const user = await User.create({ name, email, password });

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      token,
      name: user.name,
      email: user.email
    };
  }

  // Login user
  async loginUser(data: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = data;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      token,
      name: user.name,
      email: user.email
    };
  }

  // Generate JWT token
  private generateToken(user: IUserDocument): string {
    return jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        name: user.name 
      },
      config.jwtSecret,
      { expiresIn: '30d' }
    );
  }

  // Verify JWT token
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }
}

export default new AuthService();
