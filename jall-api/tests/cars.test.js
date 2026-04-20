const request = require('supertest');

const app = require('../src/app');

describe('GET /cars', () => {
  it('returns 200 and an array of cars', async () => {
    const res = await request(app).get('/cars');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toMatchObject({
      id: expect.any(Number),
      make: expect.any(String),
      model: expect.any(String),
      plate: expect.any(String),
      seats: expect.any(Number),
      available: expect.any(Boolean),
    });
  });

  it('only returns available cars', async () => {
    const res = await request(app).get('/cars');

    expect(res.body.every((car) => car.available === true)).toBe(true);
  });
});
