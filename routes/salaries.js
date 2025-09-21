import express from 'express';
import { db } from '../db.js'; // ✅ LowDB import
import { body, validationResult, query } from 'express-validator';

const router = express.Router();

// 📥 POST: Add a salary record
router.post(
  '/',
  [
    body('employee_id').notEmpty().withMessage('Employee ID is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('month').isString().withMessage('Month must be a string'),
    body('paid_by').notEmpty().withMessage('Paid by is required'),
    body('status').optional().isIn(['paid', 'pending']).withMessage('Invalid status'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      await db.read();
      db.data.salaries ||= [];

      const newSalary = {
        id: Date.now().toString(),
        employee_id: req.body.employee_id,
        amount: req.body.amount,
        month: req.body.month,
        paid_by: req.body.paid_by,
        status: req.body.status || 'paid',
        created_at: new Date().toISOString(),
      };

      db.data.salaries.push(newSalary);
      await db.write();

      res.status(201).json({ message: '✅ Salary recorded successfully', data: newSalary });
    } catch (err) {
      console.error('❌ Error recording salary:', err.message);
      res.status(500).json({ error: 'Failed to record salary' });
    }
  }
);

// 📤 GET: Retrieve salary records with optional filters
router.get(
  '/',
  [
    query('employee_id').optional().isString().withMessage('Employee ID must be a string'),
    query('month').optional().isString().withMessage('Month must be a string'),
  ],
  async (req, res) => {
    const { employee_id, month } = req.query;

    try {
      await db.read();
      let salaries = db.data.salaries || [];

      if (employee_id) {
        salaries = salaries.filter(s => s.employee_id === employee_id);
      }

      if (month) {
        salaries = salaries.filter(s => s.month === month);
      }

      salaries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      res.json(salaries);
    } catch (err) {
      console.error('❌ Error fetching salaries:', err.message);
      res.status(500).json({ error: 'Failed to fetch salary records' });
    }
  }
);

export default router;
