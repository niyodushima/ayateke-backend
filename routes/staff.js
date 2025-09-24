import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// 📤 GET: List all staff with optional filters
router.get('/', async (req, res) => {
  try {
    await db.read();
    let staff = db.data.staff || [];

    const { branch, role, status } = req.query;

    if (branch) staff = staff.filter(s => s.branch === branch);
    if (role) staff = staff.filter(s => s.role === role);
    if (status) staff = staff.filter(s => s.status === status);

    res.json(staff);
  } catch (err) {
    console.error('Error fetching staff:', err.message);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// 📥 GET: Single staff profile by ID
router.get('/:id', async (req, res) => {
  try {
    await db.read();
    const staff = db.data.staff || [];
    const person = staff.find(s => s.id === req.params.id);
    if (!person) return res.status(404).json({ error: 'Staff not found' });
    res.json(person);
  } catch (err) {
    console.error('Error fetching staff profile:', err.message);
    res.status(500).json({ error: 'Failed to fetch staff profile' });
  }
});

export default router;
