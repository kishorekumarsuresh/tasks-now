import { pool } from '../../config/db.js';
import { UserRecord } from './auth.types.js';

export class AuthRepository {
  // Find user by email for login & duplication check
  static async findByEmail(email: string): Promise<UserRecord | null> {
    const { rows } = await pool.query<UserRecord>(
      `SELECT id, email, password_hash, created_at, updated_at
       FROM users
       WHERE email = $1`,
      [email.toLowerCase()]
    );

    return rows[0] || null;
  }

  // Insert a new user record
  static async create(email: string, passwordHash: string): Promise<UserRecord> {
    const { rows } = await pool.query<UserRecord>(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, password_hash, created_at, updated_at`,
      [email.toLowerCase(), passwordHash]
    );

    return rows[0];
  }

  // Find user by ID (for auth middleware)
  static async findById(id: string): Promise<UserRecord | null> {
    const { rows } = await pool.query<UserRecord>(
      `SELECT id, email, password_hash, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id]
    );

    return rows[0] || null;
  }
}