const router = require('express').Router();
const pool   = require('../config/db');
const auth   = require('../middleware/auth');

router.use(auth);

router.post('/', async (req, res, next) => {
  let client;
  try {
    const { car_id, pickup_location, destination, ride_date } = req.body;
    if (!car_id || !pickup_location || !destination || !ride_date) {
      return res.status(400).json({
        error: 'car_id, pickup_location, destination, and ride_date are required',
      });
    }
    client = await pool.connect();
    await client.query('BEGIN');

    const carResult = await client.query(
      'SELECT id, available FROM cars WHERE id = $1 FOR UPDATE',
      [car_id]
    );
    if (carResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Car not found' });
    }
    if (!carResult.rows[0].available) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Car is not available' });
    }

    const { rows } = await client.query(
      `INSERT INTO bookings (user_id, car_id, pickup_location, destination, ride_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, car_id, pickup_location, destination, ride_date]
    );
    await client.query('UPDATE cars SET available = FALSE WHERE id = $1', [car_id]);
    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    if (client) { try { await client.query('ROLLBACK'); } catch {} }
    next(err);
  } finally {
    if (client) client.release();
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { status, search } = req.query;

    if (req.user?.role === 'admin') {
      const conditions = [];
      const params = [];
      let idx = 1;

      if (status) {
        conditions.push(`b.status = $${idx++}`);
        params.push(status);
      }
      if (search) {
        conditions.push(
          `(u.name ILIKE $${idx} OR b.pickup_location ILIKE $${idx} OR b.destination ILIKE $${idx})`
        );
        params.push(`%${search}%`);
        idx++;
      }

      const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
      const { rows } = await pool.query(
        `SELECT b.*, u.name AS client_name,
                c.make, c.model, c.plate,
                d.name AS driver_name
         FROM bookings b
         JOIN users u ON b.user_id = u.id
         JOIN cars  c ON b.car_id  = c.id
         LEFT JOIN drivers d ON b.driver_id = d.id
         ${where}
         ORDER BY b.created_at DESC`,
        params
      );
      return res.json(rows);
    }

    const { rows } = await pool.query(
      `SELECT b.*, c.make, c.model, c.plate
       FROM bookings b
       JOIN cars c ON b.car_id = c.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'active', 'completed', 'cancelled'];
    if (!valid.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${valid.join(', ')}` });
    }
    const { rows } = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/assign', async (req, res, next) => {
  try {
    const { driverId } = req.body;
    if (!driverId) return res.status(400).json({ error: 'driverId is required' });
    const { rows } = await pool.query(
      'UPDATE bookings SET driver_id = $1 WHERE id = $2 RETURNING *',
      [driverId, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
