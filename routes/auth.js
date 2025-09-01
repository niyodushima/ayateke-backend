// backend/routes/auth.js
import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    await db.read();
    const user = db.data.users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      token: 'mock-token-' + Date.now(),
      role: user.role,
      email: user.email
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

export default router;
