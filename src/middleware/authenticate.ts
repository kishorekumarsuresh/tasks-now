import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/app-error.js';
import { JwtPayload } from '../modules/auth/auth.types.js';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check if Authorization header exists and follows "Bearer <token>" pattern
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Please provide a valid Bearer token.', 401);
    }

    // 2. Extract token string
    const token = authHeader.split(' ')[1];

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    // 3. Verify signature and expiry
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, secret) as JwtPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Token has expired. Please log in again.', 401);
      }
      throw new AppError('Invalid token. Authentication failed.', 401);
    }

    // 4. Attach user context to request
    req.user = {
      id: decoded.sub,
    };

    next(); // Pass to the actual route handler
  } catch (error) {
    next(error);
  }
};