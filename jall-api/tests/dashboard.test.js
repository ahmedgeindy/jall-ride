const request = require('supertest');
const app     = require('../src/app');

let token;

beforeAll(async () => {
  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'test@jall.com', password: 'password123' });
  token = res.body.token;
});

describe('GET /dashboard/stats', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/dashboard/stats');
    expect(res.status).toBe(401);
  });

  it('returns stats object with correct shape', async () => {
    const res = await request(app)
      .get('/dashboard/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      totalBookings:  expect.any(Number),
      activeRides:    expect.any(Number),
      revenueToday:   expect.any(Number),
      availableCars:  expect.any(Number),
    });
    expect(Array.isArray(res.body.bookingsPerDay)).toBe(true);
    expect(res.body.bookingsPerDay).toHaveLength(7);
    expect(Array.isArray(res.body.recentBookings)).toBe(true);
  });
});
