import express from 'express';
import { body, validationResult, query } from 'express-validator';
import leaveController from '../controllers/leaveController.js';

const router = express.Router();

// 🧹 Validation middleware for leave submission
const validateLeaveRequest = [
  body('employee_id').notEmpty().withMessage('Employee ID is required'),
  body('type').notEmpty().withMessage('Leave type is required'),
  body('start_date').isISO8601().withMessage('Start date must be a valid date'),
  body('end_date').isISO8601().withMessage('End date must be a valid date'),
  body('reason').optional().isString().withMessage('Reason must be a string'),
  body('submitted_by').notEmpty().withMessage('Submitter ID is required'),
];

// 📥 POST: Submit a leave request
router.post('/', validateLeaveRequest, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: errors.array(),
    });
  }

  try {
    const newLeave = await leaveController.submitLeave(req.body);
    res.status(201).json({
      message: '✅ Leave request submitted successfully',
      data: newLeave,
    });
  } catch (err) {
    console.error('❌ Error submitting leave:', err.message);
    res.status(500).json({ error: 'Server error while submitting leave request' });
  }
});

// 📤 GET: Retrieve leave requests with filters + pagination
router.get(
  '/',
  [
    query('employee_id').optional().isString().withMessage('Employee ID must be a string'),
    query('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: errors.array(),
      });
    }

    const { employee_id, status, page = 1, limit = 10 } = req.query;

    try {
      const leaves = await leaveController.getLeaves({ employee_id, status, page, limit });
      res.json(leaves);
    } catch (err) {
      console.error('❌ Error fetching leaves:', err.message);
      res.status(500).json({ error: 'Failed to retrieve leave requests' });
    }
  }
);

// ✅ PATCH: Update leave request status with history tracking
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, changed_by } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  if (!changed_by) {
    return res.status(400).json({ error: 'Missing changed_by field' });
  }

  try {
    const updated = await leaveController.updateLeaveStatus(id, status, changed_by);
    if (!updated) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    res.json({ message: `Leave ${status}`, data: updated });
  } catch (err) {
    console.error('❌ Error updating leave status:', err.message);
    res.status(500).json({ error: 'Failed to update leave status' });
  }
});

// 🗑️ DELETE: Soft delete a leave request
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { deleted_by } = req.body;

  if (!deleted_by) {
    return res.status(400).json({ error: 'Missing deleted_by field' });
  }

  try {
    const deleted = await leaveController.softDeleteLeave(id, deleted_by);
    if (!deleted) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    res.json({ message: 'Leave request cancelled', data: deleted });
  } catch (err) {
    console.error('❌ Error deleting leave:', err.message);
    res.status(500).json({ error: 'Failed to cancel leave request' });
  }
});

export default router;
