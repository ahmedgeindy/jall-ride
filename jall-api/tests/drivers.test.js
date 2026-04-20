const request = require('supertest');
const app     = require('../src/app');

let token;

beforeAll(async () => {
  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'test@jall.com', password: 'password123' });
  token = res.body.token;
});

describe('GET /drivers', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/drivers');
    expect(res.status).toBe(401);
  });

  it('returns 200 and an array when authenticated', async () => {
    const res = await request(app)
      .get('/drivers')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('filters by ?available=true', async () => {
    const res = await request(app)
      .get('/drivers?available=true')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((d) => expect(d.available).toBe(true));
  });
});
