const router = require('express').Router();

const pool = require('../config/db');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', async (req, res, next) => {
  try {
    const { car_id, pickup_location, destination, ride_date } = req.body;

    if (!car_id || !pickup_location || !destination || !ride_date) {
      return res.status(400).json({
        error: 'car_id, pickup_location, destination, and ride_date are required',
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO bookings (user_id, car_id, pickup_location, destination, ride_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, car_id, pickup_location, destination, ride_date]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
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
