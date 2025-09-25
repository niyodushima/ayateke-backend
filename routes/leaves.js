import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// ✅ GET all leave requests
router.get('/', async (_req, res) => {
  try {
    await db.read();
    const leaves = db.data.leaves || [];
    res.json(leaves);
  } catch (err) {
    console.error('Error fetching leaves:', err.message);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

export default router;
