const router = require('express').Router();
const pool   = require('../config/db');
const auth   = require('../middleware/auth');

router.use(auth);

router.get('/stats', async (req, res, next) => {
  try {
    const [totalRes, activeRes, revenueRes, carsRes, perDayRes, recentRes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM bookings'),
      pool.query("SELECT COUNT(*) FROM bookings WHERE status = 'active'"),
      pool.query(
        "SELECT COALESCE(SUM(price), 0) AS total FROM bookings WHERE ride_date = CURRENT_DATE"
      ),
      pool.query('SELECT COUNT(*) FROM cars WHERE available = TRUE'),
      pool.query(`
        SELECT TO_CHAR(d::date, 'Mon DD') AS date,
               COUNT(b.id)::int           AS count
        FROM GENERATE_SERIES(
               CURRENT_DATE - INTERVAL '6 days',
               CURRENT_DATE,
               INTERVAL '1 day'
             ) d
        LEFT JOIN bookings b ON b.ride_date = d::date
        GROUP BY d
        ORDER BY d
      `),
      pool.query(`
        SELECT b.*, u.name AS client_name, d.name AS driver_name
        FROM bookings b
        JOIN  users u   ON b.user_id   = u.id
        LEFT JOIN drivers d ON b.driver_id = d.id
        ORDER BY b.created_at DESC
        LIMIT 5
      `),
    ]);

    res.json({
      totalBookings:  parseInt(totalRes.rows[0].count,    10),
      activeRides:    parseInt(activeRes.rows[0].count,   10),
      revenueToday:   parseFloat(revenueRes.rows[0].total),
      availableCars:  parseInt(carsRes.rows[0].count,     10),
      bookingsPerDay: perDayRes.rows,
      recentBookings: recentRes.rows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
