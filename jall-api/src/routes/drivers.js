const router = require('express').Router();
const pool   = require('../config/db');
const auth   = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const { available } = req.query;
    const query = available === 'true'
      ? 'SELECT * FROM drivers WHERE available = TRUE ORDER BY name'
      : 'SELECT * FROM drivers ORDER BY name';
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
