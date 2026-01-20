import { Request, Response, NextFunction } from 'express';
import authService from '@/services/auth.service';
import { validateLoginDto, validateRegisterDto } from '@/dto/auth.dto';
import { ApiResponse } from '@/utils/ApiResponse';
import { AppError } from '@/utils/AppError';

export class AuthController {
  // Register new user
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!validateRegisterDto(req.body)) {
        throw new AppError('Please provide name, email, and password', 400);
      }

      const result = await authService.registerUser(req.body);
      res.status(201).json(ApiResponse.success(result, 'User registered successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Login user
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!validateLoginDto(req.body)) {
        throw new AppError('Please provide email and password', 400);
      }

      const result = await authService.loginUser(req.body);
      res.status(200).json(ApiResponse.success(result, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
