// routes/staff.js
import express from 'express';
import { db } from '../db.js'; // ✅ Correct named import

const router = express.Router();

// GET /api/staff
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, role, department FROM staff ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
