import express from 'express';
import { db } from '../db.js'; // ✅ Correct named import

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.id, st.name, s.month, s.amount, s.status
      FROM salaries s
      JOIN staff st ON s.staff_id = st.id
      ORDER BY s.month DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching salaries:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
