import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// ✅ GET all users
router.get('/', async (_req, res) => {
  try {
    await db.read();
    const users = db.data.users || [];
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
