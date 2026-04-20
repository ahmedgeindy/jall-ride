const request = require('supertest');

const app = require('../src/app');

describe('POST /auth/login', () => {
  it('returns 200 and a JWT token for valid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@jall.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@jall.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 404 for unknown email', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@jall.com', password: 'password123' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
