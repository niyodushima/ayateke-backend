import express from 'express';
import { body, validationResult } from 'express-validator';
import Attendance from '../models/attendance.js';

const router = express.Router();

// 🧹 Validation middleware
const validateAttendance = [
  body('employee_id').notEmpty().withMessage('Employee ID is required'),
  body('date').isISO8601().withMessage('Date must be in YYYY-MM-DD format'),
  body('clock_in')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Clock In must be in HH:MM format'),
  body('clock_out')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Clock Out must be in HH:MM format'),
];

// 📥 POST: Add new attendance log
router.post('/', validateAttendance, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newLog = await Attendance.addLog(req.body);
    res.status(201).json({
      message: '✅ Attendance log added successfully',
      data: newLog,
    });
  } catch (err) {
    console.error('❌ Error adding log:', err.message);
    res.status(500).json({ error: 'Failed to add attendance log' });
  }
});

// 📤 GET: Fetch all logs (optionally filter by employee or date)
router.get('/', async (req, res) => {
  const { employee_id, date } = req.query;

  try {
    const logs = await Attendance.getLogs({ employee_id, date });
    res.json(logs);
  } catch (err) {
    console.error('❌ Error fetching logs:', err.message);
    res.status(500).json({ error: 'Failed to retrieve attendance logs' });
  }
});

// 📅 GET: Today's attendance logs
router.get('/today', async (req, res) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  try {
    const logs = await Attendance.getLogs({ date: today });
    res.json(logs);
  } catch (err) {
    console.error('❌ Error fetching today\'s logs:', err.message);
    res.status(500).json({ error: 'Failed to retrieve today\'s attendance logs' });
  }
});

export default router;
