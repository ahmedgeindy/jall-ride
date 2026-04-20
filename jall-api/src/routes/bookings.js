const router = require('express').Router();

const pool = require('../config/db');
const auth = require('../middleware/auth');

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
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, car_id, pickup_location, destination, ride_date]
    );

    await client.query(
      'UPDATE cars SET available = FALSE WHERE id = $1',
      [car_id]
    );

    await client.query('COMMIT');

    res.status(201).json(rows[0]);
  } catch (err) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // The original error is more useful than a failed rollback attempt.
      }
    }
    next(err);
  } finally {
    if (client) {
      client.release();
    }
  }
});

router.get('/', async (req, res, next) => {
  try {
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

module.exports = router;
