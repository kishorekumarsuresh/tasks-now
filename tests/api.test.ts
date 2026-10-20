import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Health and Auth Endpoints', () => {
  const randomEmail = `testuser_${Date.now()}@example.com`;
  const password = 'password123';
  let token = '';

  it('GET /api/health returns 200 and status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/auth/register creates user and returns token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: randomEmail, password });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe(randomEmail);
    token = res.body.data.token;
  });

  it('POST /api/auth/login logs in with registered user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: randomEmail, password });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('GET /api/tasks without token returns 401 Unauthorized', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });

  it('POST /api/tasks with token creates a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Task with Supertest' });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Test Task with Supertest');
    expect(res.body.data.status).toBe('pending');
  });
});