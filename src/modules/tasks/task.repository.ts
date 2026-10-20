import { pool } from '../../config/db.js';

export interface TaskRecord {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export class TaskRepository {
  // Find all tasks FOR THE AUTHENTICATED USER ONLY
  static async findMany(options: {
    userId: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<TaskRecord[]> {
    const { userId, status, limit = 10, offset = 0 } = options;
    const values: (string | number)[] = [userId];
    let query = `
      SELECT id, title, description, status, user_id, created_at, updated_at
      FROM tasks
      WHERE user_id = $1
    `;

    if (status) {
      values.push(status);
      query += ` AND status = $${values.length}`;
    }

    values.push(limit, offset);
    query += ` ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`;

    const { rows } = await pool.query<TaskRecord>(query, values);
    return rows;
  }

  // Find task by ID ONLY if it belongs to the authenticated user
  static async findById(id: string, userId: string): Promise<TaskRecord | null> {
    const { rows } = await pool.query<TaskRecord>(
      `SELECT id, title, description, status, user_id, created_at, updated_at
       FROM tasks
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    return rows[0] || null;
  }

  // Create task with assigned user_id
  static async create(data: { title: string; description?: string; userId: string }): Promise<TaskRecord> {
    const { title, description = '', userId } = data;

    const { rows } = await pool.query<TaskRecord>(
      `INSERT INTO tasks (title, description, user_id)
       VALUES ($1, $2, $3)
       RETURNING id, title, description, status, user_id, created_at, updated_at`,
      [title, description, userId]
    );

    return rows[0];
  }

  // Update task ONLY if owned by user
  static async update(
    id: string,
    userId: string,
    data: { title?: string; description?: string; status?: string }
  ): Promise<TaskRecord | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    if (fields.length === 0) {
      return this.findById(id, userId);
    }

    fields.push(`updated_at = NOW()`);

    // Add where clause parameters
    values.push(id, userId);
    const idParam = paramIndex++;
    const userParam = paramIndex++;

    const query = `
      UPDATE tasks
      SET ${fields.join(', ')}
      WHERE id = $${idParam} AND user_id = $${userParam}
      RETURNING id, title, description, status, user_id, created_at, updated_at
    `;

    const { rows } = await pool.query<TaskRecord>(query, values);
    return rows[0] || null;
  }

  // Delete task ONLY if owned by user
  static async delete(id: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return (result.rowCount ?? 0) > 0;
  }
}