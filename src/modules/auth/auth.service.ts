import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository.js';
import { AuthResponse, JwtPayload } from './auth.types.js';
import { AppError } from '../../utils/app-error.js';

const SALT_ROUNDS = 10;

export class AuthService {
  // Helper to issue signed JWTs
  private static generateToken(userId: string): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured in environment variables');
    }

    const payload: JwtPayload = { sub: userId };

    return jwt.sign(payload, secret, {
      expiresIn: '1d',
    });
  }

  // Register logic
  static async register(email: string, password: string): Promise<AuthResponse> {
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }

    // Check if user already exists
    const existingUser = await AuthRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email is already registered', 409); // 409 Conflict
    }

    // Hash password with salt
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Persist to database
    const newUser = await AuthRepository.create(email, passwordHash);

    // Generate token
    const token = this.generateToken(newUser.id);

    return {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        createdAt: newUser.created_at,
      },
    };
  }

  // Login logic
  static async login(email: string, password: string): Promise<AuthResponse> {
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Find user record
    const user = await AuthRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401); // 401 Unauthorized
    }

    // Compare plain-text password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      },
    };
  }
}