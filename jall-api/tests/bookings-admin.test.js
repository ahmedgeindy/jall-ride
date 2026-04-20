const request = require('supertest');
const app     = require('../src/app');

let token;

beforeAll(async () => {
  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'test@jall.com', password: 'password123' });
  token = res.body.token;
});

describe('PATCH /bookings/:id/status', () => {
  it('returns 400 for invalid status', async () => {
    const res = await request(app)
      .patch('/bookings/1/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'flying' });
    expect(res.status).toBe(400);
  });

  it('updates status and returns 200', async () => {
    const bookRes = await request(app)
      .post('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ car_id: 2, pickup_location: 'A', destination: 'B', ride_date: '2026-12-01' });
    const id = bookRes.body.id;

    const res = await request(app)
      .patch(`/bookings/${id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
  });
});

describe('PATCH /bookings/:id/assign', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).patch('/bookings/1/assign').send({ driverId: 1 });
    expect(res.status).toBe(401);
  });
});

describe('GET /bookings with filters', () => {
  it('returns bookings filtered by status', async () => {
    const res = await request(app)
      .get('/bookings?status=completed')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
