const request = require('supertest');

const app = require('../src/app');

let token;

beforeAll(async () => {
  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'test@jall.com', password: 'password123' });

  token = res.body.token;
});

describe('POST /bookings', () => {
  it('creates a booking and returns 201', async () => {
    const res = await request(app)
      .post('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        car_id: 1,
        pickup_location: 'Cairo Airport',
        destination: 'Tahrir Square',
        ride_date: '2026-05-01',
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(Number),
      pickup_location: 'Cairo Airport',
      destination: 'Tahrir Square',
    });
  });

  it('returns 401 without token', async () => {
    const res = await request(app).post('/bookings').send({
      car_id: 1,
      pickup_location: 'A',
      destination: 'B',
      ride_date: '2026-05-01',
    });

    expect(res.status).toBe(401);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ car_id: 1 });

    expect(res.status).toBe(400);
  });
});

describe('GET /bookings', () => {
  it('returns 200 and an array of bookings for the authenticated user', async () => {
    const res = await request(app)
      .get('/bookings')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/bookings');

    expect(res.status).toBe(401);
  });
});
