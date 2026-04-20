const router = require('express').Router();
const pool   = require('../config/db');
const auth   = require('../middleware/auth');

router.get('/', async (req, res, next) => {
  try {
    const showAll = req.query.all === 'true';
    const { rows } = await pool.query(
      showAll
        ? 'SELECT * FROM cars ORDER BY id'
        : 'SELECT * FROM cars WHERE available = TRUE ORDER BY id'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/availability', auth, async (req, res, next) => {
  try {
    const { available } = req.body;
    if (typeof available !== 'boolean') {
      return res.status(400).json({ error: 'available must be a boolean' });
    }
    const { rows } = await pool.query(
      'UPDATE cars SET available = $1 WHERE id = $2 RETURNING *',
      [available, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
