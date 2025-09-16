import express from 'express';
import { body, validationResult } from 'express-validator';
import Attendance from '../models/attendance.js';

const router = express.Router();

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

// ✅ Original check-in route
router.post('/', validateAttendance, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const newLog = await Attendance.addLog(req.body);
    res.status(201).json({ message: '✅ Attendance log added successfully', data: newLog });
  } catch (err) {
    console.error('❌ Error adding log:', err.message);
    res.status(500).json({ error: 'Failed to add attendance log' });
  }
});

// ✅ Add POST /checkin to match frontend
router.post('/checkin', async (req, res) => {
  const { employee_id, date, clock_in } = req.body || {};
  if (!employee_id || !date || !clock_in) {
    return res.status(400).json({ error: 'Missing required fields for check-in' });
  }

  try {
    const newLog = await Attendance.addLog({
      employee_id,
      date,
      clock_in,
      clock_out: '00:00',
    });
    res.status(201).json({ message: '✅ Checked in successfully', data: newLog });
  } catch (err) {
    console.error('❌ Error during check-in:', err.message);
    res.status(500).json({ error: 'Failed to check in' });
  }
});

// ✅ Add POST /checkout to match frontend
router.post('/checkout', async (req, res) => {
  const { employee_id, date, clock_out } = req.body || {};
  if (!employee_id || !date || !clock_out) {
    return res.status(400).json({ error: 'Missing required fields for check-out' });
  }

  try {
    const updated = await Attendance.updateClockOut({ employee_id, date, clock_out });
    if (!updated) {
      return res.status(404).json({ error: 'No matching record found for check-out' });
    }
    res.status(200).json({ message: '✅ Checked out successfully', data: updated });
  } catch (err) {
    console.error('❌ Error during check-out:', err.message);
    res.status(500).json({ error: 'Failed to check out' });
  }
});

// ✅ Fetch logs
router.get('/', async (req, res) => {
  const { employee_id, date, start, end } = req.query;

  try {
    const logs = await Attendance.getLogs({ employee_id, date, start, end });
    res.status(200).json(Array.isArray(logs) ? logs : []);
  } catch (err) {
    console.error('❌ Error fetching logs:', err.message);
    res.status(500).json({ error: 'Failed to retrieve attendance logs' });
  }
});

// ✅ Today's logs
router.get('/today', async (req, res) => {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Kigali' });

  try {
    const logs = await Attendance.getLogs({ date: today });
    res.status(200).json(Array.isArray(logs) ? logs : []);
  } catch (err) {
    console.error("❌ Error fetching today's logs:", err.message);
    res.status(500).json({ error: "Failed to retrieve today's attendance logs" });
  }
});

// ✅ Original PUT /checkout (still supported)
router.put('/checkout', async (req, res) => {
  const { employee_id, date, clock_out } = req.body || {};

  if (!employee_id || !date || !clock_out) {
    return res.status(400).json({
      error: 'Missing required fields: employee_id, date, and clock_out',
    });
  }

  try {
    const updated = await Attendance.updateClockOut({ employee_id, date, clock_out });
    if (!updated) {
      return res.status(404).json({
        error: 'No matching attendance record found for check-out',
      });
    }
    res.status(200).json({ message: '✅ Checked out successfully', data: updated });
  } catch (err) {
    console.error('❌ Error during check-out:', err.message);
    res.status(500).json({ error: 'Failed to update attendance log' });
  }
});

export default router;
