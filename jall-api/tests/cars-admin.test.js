const request = require('supertest');
const app     = require('../src/app');

describe('GET /cars?all=true', () => {
  it('returns all cars including unavailable when all=true', async () => {
    const res = await request(app).get('/cars?all=true');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('color');
  });
});

describe('PATCH /cars/:id/availability', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).patch('/cars/1/availability').send({ available: false });
    expect(res.status).toBe(401);
  });

  it('returns 400 for non-boolean available value', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'test@jall.com', password: 'password123' });
    const { token } = loginRes.body;

    const res = await request(app)
      .patch('/cars/1/availability')
      .set('Authorization', `Bearer ${token}`)
      .send({ available: 'yes' });
    expect(res.status).toBe(400);
  });

  it('updates availability and returns 200', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'test@jall.com', password: 'password123' });
    const { token } = loginRes.body;

    const res = await request(app)
      .patch('/cars/1/availability')
      .set('Authorization', `Bearer ${token}`)
      .send({ available: true });
    expect(res.status).toBe(200);
    expect(res.body.available).toBe(true);
  });
});
